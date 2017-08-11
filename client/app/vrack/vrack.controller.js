angular.module("managerApp").controller("VrackCtrl",
    function ($scope, $q, $stateParams, $state, $timeout, $translate, $uibModal, Toast, SidebarMenu, Vrack, CloudProject, User, URLS, VrackService) {
    "use strict";
    var self = this;
    var pollingInterval = 5000;

    self.poller = null;
    self.serviceName = null;
    self.name = null;
    self.description = null;
    self.nameEditing = false;
    self.descriptionEditing = false;
    self.nameOptions = { pattern: /^([a-zA-Z])\S*$/, maxLength: 100 };
    self.descriptionOptions = { maxLength: 255 };
    self.changeOwnerUrl = null;
    self.vRackCloudRoadmapGuide = null;
    self.vrackService = VrackService;

    self.modals = {
        move: null
    };

    self.loaders = {
        init: false,
        adding: false,
        deleting: false,
        moving: false
    };

    self.data = {
        cloudProjects: [],
        allowedServices: {},
        vrackServices: {},
        pendingTasks: []
    };

    self.form = {
        servicesToAdd: [],
        servicesToDelete: [],
        serviceToMove: null
    };

    self.states = {
        accordions: {
            available: {
                types: [],
                groups: [],
                dedicatedCloudNetworks: []
            },
            mapped: {
                types: [],
                groups: [],
                dedicatedCloudNetworks: [],
                dedicatedCloudDatacenters: []
            }
        }
    };

    self.groupedServiceKeys = {
        dedicatedCloudDatacenter: "dedicatedCloud.niceName",
        dedicatedServerInterface: "dedicatedServer.niceName"
    };

    self.getDisplayName = function (serviceType) {
        return $translate.instant("vrack_service_type_" + serviceType.toLowerCase());
    };

    self.getAllowedServices = function () {
        return Vrack.Aapi().allowedServices({ serviceName: self.serviceName }).$promise
            .then(function (allServices) {
                allServices = _.mapValues(allServices, function (services, serviceType) {
                    if (_.isArray(services)) {
                        return _.map(services, function (service) {
                            return fillServiceData(serviceType, service);
                        });
                    } else {
                        return services;
                    }
                });

                //We need to append dedicatedServerInterfaces list to dedicatedServers list.
                if (_.has(allServices, "dedicatedServerInterface") && allServices.dedicatedServerInterface.length > 0) {
                    //If dedicatedServers list doesn't exist, we create it first.
                    if (!_.has(allServices, "dedicatedServer")) {
                        allServices.dedicatedServer = [];
                    }

                    angular.forEach(allServices.dedicatedServerInterface, function (serverInterface) {
                        allServices.dedicatedServer.push(serverInterface);
                    });

                    allServices.dedicatedServerInterface = [];
                }

                return allServices;
            });
    };

    self.getVrackServices = function () {
        return Vrack.Aapi().services({ serviceName: self.serviceName }).$promise
            .then(function (allServices) {
                allServices = _.mapValues(allServices, function (services, serviceType) {
                    if (_.isArray(services)) {
                        services = _.map(services, function (service) {
                            return fillServiceData(serviceType, service);
                        });
                    }
                    return services;
                });

                if (_.has(allServices, "dedicatedCloudDatacenter")) {
                    allServices.dedicatedCloudDatacenter = _.groupBy(allServices.dedicatedCloudDatacenter, self.groupedServiceKeys.dedicatedCloudDatacenter);
                }

                //We need to append dedicatedServerInterfaces list to dedicatedServers list.
                if (_.has(allServices, "dedicatedServerInterface") && allServices.dedicatedServerInterface.length > 0) {
                    //If dedicatedServers list doesn't exist, we create it first.
                    if (!_.has(allServices, "dedicatedServer")) {
                        allServices.dedicatedServer = [];
                    }

                    angular.forEach(allServices.dedicatedServerInterface, function (serverInterface) {
                        allServices.dedicatedServer.push(serverInterface);
                    });

                    allServices.dedicatedServerInterface = [];
                }

                return allServices;
            });
    };

    self.getPendingTasks = function () {
        return Vrack.Lexi().tasks({
            serviceName: self.serviceName
        }).$promise.then(function (taskIds) {
            return $q.all(_.map(taskIds, function (id) {
                return Vrack.Lexi().task({
                    serviceName: self.serviceName,
                    taskId: id
                }).$promise.then(function (task) {
                    return task;
                }).catch(function (err) {
                    //No pending task
                    return err.status === 404 ? $q.when(null) : $q.reject(err);
                });
            })).then(function (tasks) {
                return _.without(tasks, null);
            });
        });
    };

    self.resetCache = function () {
        Vrack.Lexi().resetCache();
        Vrack.CloudProject().Lexi().resetQueryCache();
        Vrack.DedicatedCloud().Lexi().resetQueryCache();
        Vrack.DedicatedServer().Lexi().resetQueryCache();
        Vrack.DedicatedServerInterface().Lexi().resetQueryCache();
        Vrack.Ip().Lexi().resetQueryCache();
        Vrack.LegacyVrack().Lexi().resetQueryCache();
        Vrack.Aapi().resetAllCache();
    };

    self.moveDisplayedService = function (serviceId, allServicesSource, allServicesDestination) {
        var serviceToMove = null;
        var typeToMove = null;
        var isGroupedServicesType = false;
        _.forEach(allServicesSource, function (services, type) {
            var servicesToSearch = !_.isArray(allServicesSource[type]) ?
                                        _.flatten(_.values(allServicesSource[type])) :
                                        allServicesSource[type];

            serviceToMove = _.remove(servicesToSearch, function (service) {
                if (service.id === serviceId) {
                    typeToMove = type;
                    isGroupedServicesType = !_.isArray(allServicesSource[type]);
                    return true;
                }
            });

            if (!_.isEmpty(serviceToMove)) {
                if (isGroupedServicesType) {
                    allServicesSource[typeToMove] = _.groupBy(servicesToSearch, self.groupedServiceKeys[typeToMove]);
                } else {
                    allServicesSource[typeToMove] = servicesToSearch;
                }

                return false;
            }
        });

        if (serviceToMove && typeToMove) {
            if (isGroupedServicesType) {
                var services = _.flatten(_.values(allServicesDestination[typeToMove]));
                services.push(serviceToMove[0]);
                allServicesDestination[typeToMove] = _.groupBy(services, self.groupedServiceKeys[typeToMove]);
            } else {
                allServicesDestination[typeToMove].push(serviceToMove[0]);
            }
        }
    };

    self.refreshData = function () {
        var poll = true;
        return self.getPendingTasks().then(function (tasks) {
            /**
             * First, we check if there is any new pending tasks ...
             */
            var currentTasks = _.pluck(tasks, "id");
            var previousTasks = _.pluck(self.data.pendingTasks, "id");
            if (_.difference(currentTasks, previousTasks).length || _.difference(previousTasks, currentTasks).length) {
                self.resetCache(); // a task changed, vrack state might have changed too
            } else if (tasks.length === 0) {
                poll = false; // no new tasks & no tasks, no need to poll
            }
            /**
             * Secondly, we fetch vrack data ...
             */
            return $q.all({
                allowedServices: self.getAllowedServices(),
                vrackServices: self.getVrackServices()
            }).then(function (result) {
                self.data.pendingTasks = tasks;
                self.data.allowedServices = result.allowedServices;
                self.data.vrackServices = result.vrackServices;

                /**
                 * Finally, check if some tasks are adding or removing services in vrack
                 * and move the service in his "future" column
                 */
                angular.forEach(self.data.pendingTasks, function (task) {
                    if (task && task.targetDomain) {
                        var id = task.targetDomain;
                        var fn = task["function"];
                        if (_.startsWith(fn, "add")) {
                            self.moveDisplayedService(id, self.data.allowedServices, self.data.vrackServices);
                        } else if (_.startsWith(fn, "remove")) {
                            self.moveDisplayedService(id, self.data.vrackServices, self.data.allowedServices);
                        }
                        self.form.servicesToAdd = _.reject(self.form.servicesToAdd, { id: id });
                        self.form.servicesToDelete = _.reject(self.form.servicesToDelete, { id: id });
                    }
                });
            });
        }).finally(function () {
            // if there are some pending tasks, poll
            if (poll && !self.poller) {
                self.poller = $timeout(function () {
                    self.poller = null;
                    self.refreshData();
                }, pollingInterval);
            }
        });
    };

    self.isSelected = function (serviceType, serviceId) {
        return angular.isDefined(_.find(self.form.servicesToAdd, { type: serviceType, id: serviceId })) ||
               angular.isDefined(_.find(self.form.servicesToDelete, { type: serviceType, id: serviceId })) ||
               _.isEqual(self.form.serviceToMove, { type: serviceType, id: serviceId });
    };

    self.isPending = function (serviceId) {
        var ids = _.uniq(_.pluck(self.data.pendingTasks, "targetDomain"));
        return ids.indexOf(serviceId) >= 0;
    };

    self.toggleAddService = function (serviceType, serviceId) {
        if (!self.isPending(serviceId) && !self.loaders.adding && !self.loaders.deleting) {
            var toAdd = { type: serviceType, id: serviceId };
            if (_.find(self.form.servicesToAdd, toAdd)) {
                self.form.servicesToAdd = _.reject(self.form.servicesToAdd, toAdd);
            } else {
                self.form.servicesToAdd.push(toAdd);
            }
            self.form.serviceToMove = null
            self.form.servicesToDelete = [];
        }
    };

    self.toggleDeleteService = function (serviceType, serviceId) {
        if (!self.isPending(serviceId) && !self.loaders.adding && !self.loaders.deleting) {
            var toDelete = { type: serviceType, id: serviceId };
            if (_.find(self.form.servicesToDelete, toDelete)) {
                self.form.servicesToDelete = _.reject(self.form.servicesToDelete, toDelete);
            } else {
                self.form.servicesToDelete.push(toDelete);
            }
            self.form.serviceToMove = null
            self.form.servicesToAdd = [];
        }
    };

    self.toggleMoveService = function (serviceType, serviceId) {
        if (self.isPending(serviceId) || self.loaders.moving) {
            return;
        }
        var toMove = { type: serviceType, id: serviceId };
        if (self.form.serviceToMove === null) {
            self.form.servicesToAdd = self.form.servicesToDelete = [];
            self.form.serviceToMove = toMove;
        } else {
            self.form.serviceToMove = null;
        }
    };

    self.editName = function () {
        self.nameEditing = true;
        self.nameBackup = self.name;
    };

    self.cancelEditName = function () {
        self.nameEditing = false;
        self.name = self.nameBackup;
    };

    self.saveName = function () {
        self.nameEditing = false;

        Vrack.Lexi().edit({ serviceName: self.serviceName }, { name: self.name }).$promise
            .catch(function (err) {
                self.name = self.nameBackup;
                Toast.error([$translate.instant("vrack_error"), err.data && err.data.message || err.message || ""].join(" "));
            })
            .finally(function () {
                 var menuItem = SidebarMenu.getItemById(self.serviceName);
                if (menuItem) {
                    menuItem.title = self.name || self.serviceName;
                }
                self.nameBackup = null;
            });
    };

    self.editDescription = function () {
        self.descriptionEditing = true;
        self.descriptionBackup = self.description;
    };

    self.cancelEditDescription = function () {
        self.descriptionEditing = false;
        self.description = self.descriptionBackup;
    };

    self.saveDescription = function () {
        self.descriptionEditing = false;
        Vrack.Lexi().edit({ serviceName: self.serviceName }, { description: self.description }).$promise
            .catch(function (err) {
                self.description = self.descriptionBackup;
                Toast.error([$translate.instant("vrack_error"), err.data && err.data.message || err.message || ""].join(" "));
            })
            .finally(function () {
                self.descriptionBackup = null;
            });
    };

    self.addSelectedServices = function () {
        self.loaders.adding = true;
        return $q.all(_.map(self.form.servicesToAdd, function (service) {
            var task = $q.reject("Unknown service type");
            switch (service.type) {
                case "dedicatedServer":
                    task = Vrack.DedicatedServer().Lexi().create({
                        serviceName: self.serviceName
                    }, {
                        dedicatedServer: service.id
                    }).$promise;
                    break;
                case "dedicatedServerInterface":
                    task = Vrack.DedicatedServerInterface().Lexi().post({
                        serviceName: self.serviceName
                    }, {
                        dedicatedServerInterface: service.id
                    }).$promise;
                    break;
                case "dedicatedCloud":
                    task = Vrack.DedicatedCloud().Lexi().create({
                        serviceName: self.serviceName
                    }, {
                        dedicatedCloud: service.id
                    }).$promise;
                    break;
                case "legacyVrack":
                    task = Vrack.LegacyVrack().Lexi().create({
                        serviceName: self.serviceName
                    }, {
                        legacyVrack: service.id
                    }).$promise;
                    break;
                case "ip":
                    task = Vrack.Ip().Lexi().create({
                        serviceName: self.serviceName
                    }, {
                        block: service.id
                    }).$promise;
                    break;
                case "cloudProject":
                    task = Vrack.CloudProject().Lexi().create({
                        serviceName: self.serviceName
                    }, {
                        project: service.id
                    }).$promise;
                    break;
            }
            return task.catch(function (err) {
                Toast.error([$translate.instant("vrack_add_error"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            });
        })).then(function () {
            return self.refreshData();
        }).finally(function () {
            self.form.servicesToAdd = [];
            self.loaders.adding = false;
        });
    };

    self.deleteSelectedServices = function () {
        self.loaders.deleting = true;
        return $q.all(_.map(self.form.servicesToDelete, function (service) {
            var task = $q.reject("Unknown service type");
            switch (service.type) {
                case "dedicatedServer":
                    task = Vrack.DedicatedServer().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        dedicatedServer: service.id
                    }).$promise;
                    break;
                case "dedicatedServerInterface":
                    task = Vrack.DedicatedServerInterface().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        dedicatedServerInterface: service.id
                    }).$promise;
                    break;
                case "dedicatedCloud":
                    task = Vrack.DedicatedCloud().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        dedicatedCloud: service.id
                    }).$promise;
                    break;
                case "legacyVrack":
                    task = Vrack.LegacyVrack().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        legacyVrack: service.id
                    }).$promise;
                    break;
                case "ip":
                    task = Vrack.Ip().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        ip: service.id
                    }).$promise;
                    break;
                case "cloudProject":
                    task = Vrack.CloudProject().Lexi()["delete"]({
                        serviceName: self.serviceName,
                        project: service.id
                    }).$promise;
                    break;
            }
            return task.catch(function (err) {
                Toast.error([$translate.instant("vrack_remove_error"), err.data && err.data.message || ""].join(" "));
                return $q.reject(err);
            });
        })).then(function () {
            return self.refreshData();
        }).finally(function () {
            self.form.servicesToDelete = [];
            self.loaders.deleting = false;
        });
    };

    self.moveSelectedService = function (serviceType, serviceId) {
        self.modals.move = $uibModal.open({
            templateUrl: "app/vrack/move-dialog/vrack-move-dialog.html",
            controller: "VrackMoveDialogCtrl as ctrl",
            resolve: {
                service: function () {
                    return _.merge(self.form.serviceToMove, {
                        vrack: self.serviceName
                    });
                }
            }
        });

        self.modals.move.result.then(function () {
            self.refreshData();
        }).finally(function () {
            self.form.serviceToMove = null;
        });
    };

    self.setAccordionState = function (side, kind, offset, value) {
        self.states.accordions[side][kind][offset] = value;
    };

    self.getAccordionState = function (side, kind, offset) {
        if (!_.has(self.states.accordions, [side, kind, offset])) {
            return true;
        }

        return self.states.accordions[side][kind][offset];
    };

    self.toggleAccordion = function (side, kind, offset) {
        self.states.accordions[side][kind][offset] = !self.states.accordions[side][kind][offset];
    };

    self.isAdding = function () {
        return self.form.servicesToAdd.length > 0 && !self.loaders.adding;
    };

    self.isRemoving = function () {
        return self.form.servicesToDelete.length > 0 && !self.loaders.deleting;
    };

    self.isMoving = function () {
        return self.form.serviceToMove !== null && !self.loaders.moving;
    };

    self.hasVrackGuideUrl = function () {
        return false;
    };

    self.hasServices = function (services) {
        return _.keys(services).length > 0;
    };

    function setUserRelatedContent () {
        User.Lexi().get().$promise
            .then(function (user) {
                if (user.ovhSubsidiary === "FR") {
                    // Roadmap is only available in french
                    self.vRackCloudRoadmapGuide = URLS.guides.vrack.FR;
                }
                self.changeOwnerUrl = URLS.changeOwner[user.ovhSubsidiary];
            });
    }

    function fillServiceData (serviceType, service) {
        var formattedService = null;
        switch (serviceType) {
        case "dedicatedServer":
            formattedService = getDedicatedServerNiceName(service);
            break;
        case "dedicatedServerInterface":
            formattedService = getDedicatedServerInterfaceNiceName(service);
            break;
        case "dedicatedCloud":
            formattedService = getDedicatedCloudNiceName(service);
            break;
        case "dedicatedCloudDatacenter":
            formattedService = _.cloneDeep(service);
            formattedService.id = service.datacenter;
            formattedService.niceName = _.last(service.datacenter.split("_"));
            if (_.isObject(service.dedicatedCloud)) {
                formattedService.dedicatedCloud.niceName = service.dedicatedCloud.serviceName + " (" + service.dedicatedCloud.description + ")";
            } else {
                formattedService.dedicatedCloud = {
                    niceName: service.dedicatedCloud
                };
            }
            formattedService.trueServiceType = "dedicatedCloudDatacenter";
            break;
        case "legacyVrack":
        case "ip":
            formattedService = {
                id: service,
                niceName: service,
                trueServiceType: "ip"
            };
            break;
        case "cloudProject":
            formattedService = getCloudProjectNiceName(service);
            break;
        default:
            formattedService = _.cloneDeep(service);
            break;
        }
        return formattedService;
    }

    function getDedicatedServerNiceName (service) {
        var formattedService = {};
        angular.copy(service, formattedService);
        formattedService.id = service.name;
        // by default the reverse seem to be equal to the name, so do not display redondant information.
        if (service.reverse && service.reverse !== service.name) {
            formattedService.niceName =  service.name + " (" + service.reverse + ")";
        } else {
            formattedService.niceName = service.name;
        }
        formattedService.trueServiceType = "dedicatedServer";
        return formattedService;
    }

    function getDedicatedServerInterfaceNiceName (service) {
        var formattedService = getDedicatedServerNiceName(service.dedicatedServer);
        formattedService.id = service.dedicatedServerInterface;
        formattedService.niceName = formattedService.niceName + " - " + service.name;
        formattedService.trueServiceType = "dedicatedServerInterface";
        return formattedService;
    }

    function getDedicatedCloudNiceName (service) {
        var formattedService = {};
        angular.copy(service, formattedService);
        formattedService.id = service.serviceName;
        if (service.description) {
            formattedService.niceName = service.serviceName + " (" + service.description + ")";
        } else {
            formattedService.niceName = service.serviceName;
        }
        formattedService.trueServiceType = "dedicatedCloud";
        return formattedService;
    }

    function getCloudProjectNiceName (service) {
        var formattedService = {};
        angular.copy(service, formattedService);
        formattedService.id = service.project_id;
        if (service.description) {
            formattedService.niceName = service.description;
        } else {
            formattedService.niceName = service.project_id;
        }
        formattedService.trueServiceType = "cloudProject";
        return formattedService;
    }

    function init () {
        if (_.isEmpty($stateParams.vrackId)) {
            Vrack.Lexi().query().$promise
                .then(function (vracks) {
                    if (_.isEmpty(vracks)) {
                        $state.go("vrack-add");
                    } else {
                        $state.go("vrack", { vrackId: vracks[0] });
                    }
                }).catch(function () {
                    $state.go("vrack-add");
                });
        } else {
            // check if the serviceName is valid before loading the services
            Vrack.Lexi().get({
                serviceName: $stateParams.vrackId
            }).$promise.then(function (resp) {
                self.serviceName = $stateParams.vrackId;
                self.name = resp.name;
                self.description = resp.description;
                setUserRelatedContent();
                self.refreshData();
            }).catch(function (err) {
                Toast.error([$translate.instant("vrack_error"), err.data && err.data.message || ""].join(" "));
            });
        }
    }

    init();

    $scope.$on("$destroy", function () {
        if (self.poller) {
            $timeout.cancel(self.poller);
        }
    });
});
