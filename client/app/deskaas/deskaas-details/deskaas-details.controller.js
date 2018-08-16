"use strict";

angular.module("managerApp").controller("DeskaasDetailsCtrl",
    function (OvhApiDeskaasService, $stateParams, $scope, ControllerHelper, CloudMessage, $translate, $state, $q, DESKAAS_ACTIONS, $uibModal,
              OvhApiMe, deskaasSidebar, DeskaasService, DESKAAS_REFERENCES, SidebarMenu, FeatureAvailabilityService, ServiceHelper) {

    var self = this;

    self.services = {};
    self.details = {};
    self.messages = [];
    self.user = {};
    self.upgradeOptions = [];
    self.selectedUpgrade = "";
    self.tasksHandler = null;
    self.ServiceHelper = ServiceHelper;

    self.references = DESKAAS_REFERENCES;

    self.OrderPlanOffers = [];

    self.actions = {
        reinit: {
            text: $translate.instant("vdi_btn_restore"),
            callback: () => self.restoreService($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        restart: {
            text: $translate.instant("vdi_btn_reboot"),
            callback: () => self.rebootService($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        changePassword: {
            text: $translate.instant("vdi_btn_reset_password"),
            callback: () => self.resetPassword($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        remove: {
            text: $translate.instant("vdi_btn_delete"),
            callback: () => self.deleteService($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        accessConsole: {
            text: $translate.instant("vdi_btn_console"),
            callback: () => self.getConsole($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        changeOffer: {
            text: $translate.instant("vdi_btn_upgrade"),
            callback: () => self.upgrade($stateParams.serviceName),
            isAvailable: () => self.flags.editable() && self.flags.can_upgrade()
        },
        changeAlias: {
            text: $translate.instant("common_modify"),
            callback: () => self.changeAlias($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        },
        manageAutorenew: {
            text: $translate.instant("common_manage"),
            href: ControllerHelper.navigation.getUrl("renew", { serviceName: $stateParams.serviceName, serviceType: "DESKAAS" }),
            isAvailable: () => true
        },
        manageContact: {
            text: $translate.instant("common_manage"),
            href: ControllerHelper.navigation.getUrl("contacts", { serviceName: $stateParams.serviceName }),
            isAvailable: () => FeatureAvailabilityService.hasFeature("CONTACTS", "manage")
        }
    };


    self.loadMessage = function () {
        CloudMessage.unSubscribe("deskaas.details");
        self.messageHandler = CloudMessage.subscribe("deskaas.details", { onMessage: () => self.refreshMessage() });
    };

    self.refreshMessage = function () {
        self.messages = self.messageHandler.getMessages();
    };

    /*
        restartInstance: {
 +                text: this.$translate.instant("cloud_db_home_tile_status_instance_restart"),
 +                callback: () => this.CloudDbActionService.showInstanceRestartModal(this.projectId, this.instanceId),
 +                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
 +            }

    */

    // Task handler
    var TasksHandler = function () {
        // FIXME we do not check if some new task are created in another session
        // List of tasks to poll
        var selfTask = this;
        selfTask.tasks = {};
        selfTask.cleanTasks = [];
        var _allowedTask = []; //use getAllowedTask to populate the array

        this.getAllowedTasks = function () {
            if (_allowedTask.length === 0) {
                // Get taskName from actions constant
                Object.keys(DESKAAS_ACTIONS).forEach(function (taskName) {
                    _allowedTask.push(DESKAAS_ACTIONS[taskName]);
                });
            }
            return _allowedTask;
        };

        // Do we already know this task
        this.isIn = function (task) {
            return typeof selfTask.tasks[task.taskId] !== "undefined";
        };

        this.length = function () {
            return Object.keys(selfTask.tasks).length;
        };

        // Check if we have running task
        this.tasksIsRunning = function () {
            var isRunning = false;
            Object.keys(selfTask.tasks).forEach(function (key) {
                var value = selfTask.tasks[key];
                // We do not block if the console_access is not done
                if (value.name !== DESKAAS_ACTIONS.CONSOLE_ACCESS && value.state !== "done" && value.state !== "canceled") {
                    isRunning = true;
                }
            });
            return isRunning;
        };

        this.getCleanTasks = function () {
            return _.mapValues(selfTask.tasks, value => value);
        };

        // Check if we have a task on error
        this.taskOnError = function () {
            var onError = false;
            Object.keys(selfTask.tasks).forEach(function (key) {
                var value = selfTask.tasks[key];
                if (value.state === "error") {
                    onError = true;
                }
            });
            return onError;
        };

        this.addOrUpdate = function (task, isUserTask) {
            if (typeof task.taskId === "undefined") {
                return;
            }
            if (selfTask.getAllowedTasks().indexOf(task.name) === -1) {
                return; //task not allowed
            }

            var opts = {
                serviceName : $stateParams.serviceName,
                taskId      : task.taskId,
                isUserTask    : isUserTask
            };
            task.displayState = $translate.instant("vdi_task_state_" + task.state);
            task.displayName = $translate.instant("vdi_task_name_" + task.name);
            task.status = task.state;
            if (selfTask.isIn(task)) {
                // we have the task, we need to update
                // TODO If task change from one status to error or problem we need to display a message
                if ((task.state === "error" || task.state === "problem") && selfTask.tasks[task.taskId].state !== task.state) {
                    // Display message and set flags
                    onTaskError(task);
                }
                selfTask.tasks[task.taskId].state = task.state;
                selfTask.tasks[task.taskId].displayState = task.displayState;
                selfTask.tasks[task.taskId].displayName = task.displayName;
                selfTask.tasks[task.taskId].lastModificationDate = task.lastModificationDate;
                selfTask.tasks[task.taskId].progress = task.progress;
                selfTask.tasks[task.taskId].status = task.state;
                // TODO remove task if status == 'done' and display a message
                if (task.state === "done") {
                    OvhApiDeskaasService.stopPollTask($scope, opts);
                    onTaskSuccess(task);
                } else if (task.state === "canceled") {
                    OvhApiDeskaasService.stopPollTask($scope, opts);
                }
                return;
            }
            task.serviceName = $stateParams.serviceName;
            task.isUserTask = false;
            task.poller = OvhApiDeskaasService.pollTask($scope, opts).then(selfTask.addOrUpdate, selfTask.addOrUpdate, selfTask.addOrUpdate);
            // Add a new entry in the map
            selfTask.tasks[task.taskId] = task;
            selfTask.cleanTasks.push(task);
        };
    };

    self.flags = {
        init: {
            getTasks: false,
            details: false,
            serviceInfos: false,
            user: false
        },
        can_upgrade: function () {
            var ref = [];
            // Tasks are retrieved, no upgrading and planCode and offers are retrieved
            if (!self.flags.init.getTasks && !self.flags.upgrading && _.has(self, "details.planCode") && self.OrderPlanOffers.length !== 0) {
                ref = DeskaasService.getUpgradeOptions(self.details.planCode);
            }
            self.upgradeOptions = ref;
            return self.upgradeOptions.length !== 0;
        },
        initializing: function () {return self.flags.init.getTasks || self.flags.init.details || self.flags.init.serviceInfos || self.flags.init.user; },
        restoring: false,
        rebooting: false,
        upgrading: false,
        resettingPassword: false,
        changingAlias: false,
        changingUsername: false,
        deleting: false,
        error: function () {return self.tasksHandler.taskOnError(); },
        taskRunning: function () { return self.tasksHandler.tasksIsRunning();},
        ready: function () { return !self.flags.taskRunning(); },
        actionable: function () {return self.services.status === "ok";},
        editable: function () {
            return self.flags.ready() && !self.flags.initializing() &&
                !self.flags.error() && self.flags.actionable();
        }
    };

    function handleMethodCall (promise, success) {

        return promise
            .then(success)
            .catch(function (err) {
                var msg = _.get(err, "data.message", "");
                CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));
                return $q.reject(err);
            });
    }

    function handleServiceMethodCall (promise, successMessage, flagName) {

        self.flags[flagName] = true;

        return handleMethodCall(
            promise,
            function (response) {
                CloudMessage.success(successMessage);
                return response;
            })
            .catch(function (err) {
                self.flags[flagName] = false;
                return $q.reject(err);
            });
    }

    self.getConsole = function () {
        return ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/deskaas/deskaas-get-console-access/deskaas-get-console-access.html",
                controller: "DeskaasGetConsoleAccessCtrl",
                controllerAs: "DeskaasGetConsoleAccessCtrl",
                backdrop: "static",
                size: "md"
            }
        })
            .then(function () {
                getConsole().catch(function (err) {
                    var msg = _.get(err, "data.message", "");
                    CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function getConsole () {
        var promise;

        promise = OvhApiDeskaasService.v6().console({ serviceName: $stateParams.serviceName }, null).$promise;

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_console_task"),
            "getConsoleAccess")
            .then(function (response) {
                handleTask(response.taskId, true);
            });
    }

    self.deleteService = function () {
        return ControllerHelper.modal.showConfirmationModal({
            titleText: $translate.instant("vdi_btn_delete"),
            text: $translate.instant("vdi_confirm_delete")
        })
            .then(() => {
                var promise = OvhApiDeskaasService.v6().deleteService({ serviceName: $stateParams.serviceName }, null).$promise;

                return handleServiceMethodCall(
                    promise,
                    $translate.instant("vdi_deleting"),
                    "deleting");
            });
    };

    self.resetPassword = function () {

        var modal = $uibModal.open({
            templateUrl     : "app/deskaas/deskaas-change-password/deskaas-change-password.html",
            controller      : "DeskaasChangePasswordCtrl",
            controllerAs    : "vm",
            backdrop        : "static",
            size            : "lg",
            resolve         : {
                service : function () { return self.serviceName; }
            }
        });

        modal.result.then(function (modalValues) {

            resetPassword(modalValues)
                .catch(function (err) {

                    var msg = _.get(err, "data.message", "");
                    CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));

                });

        });

    };

    function resetPassword (passwordParams) {

        var promise;

        if (passwordParams.generatePwd) {
            promise = OvhApiDeskaasService.v6().resetPassword({ serviceName: $stateParams.serviceName }, null).$promise;
        } else if (passwordParams.password) {
            promise = OvhApiDeskaasService.v6().resetPassword({ serviceName: $stateParams.serviceName }, { password: passwordParams.password }).$promise;
        } else {
            return $q.when();
        }

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_resetting_password"),
            "resettingPassword")
            .then(function (response) {
                handleTask(response.taskId, true);
            });

    }

    self.restoreService = function () {
        return ControllerHelper.modal.showConfirmationModal({
            titleText: $translate.instant("vdi_btn_restore"),
            text: $translate.instant("vdi_confirm_restore")
        })
            .then(() => {
                var promise = OvhApiDeskaasService.v6().restoreService({ serviceName: $stateParams.serviceName }, null).$promise;

                return handleServiceMethodCall(
                    promise,
                    $translate.instant("vdi_restoring"),
                    "restoring")
                    .then(function (response) {
                        handleTask(response.taskId);
                    });
            });
    };

    self.rebootService = function () {
        return ControllerHelper.modal.showConfirmationModal({
            titleText: $translate.instant("vdi_btn_reboot"),
            text: $translate.instant("vdi_confirm_reboot")
        })
            .then(() => {
                var promise = OvhApiDeskaasService.v6().rebootService({ serviceName: $stateParams.serviceName }, null).$promise;

                return handleServiceMethodCall(
                    promise,
                    $translate.instant("vdi_rebooting"),
                    "rebooting")
                    .then(function (response) {
                        handleTask(response.taskId);
                    });
            });
    };

    function upgradeService (planCode) {
        if (!planCode) {
            return $q.when();
        }

        var promise = OvhApiDeskaasService.v6().upgradeService({ serviceName: $stateParams.serviceName }, { planCode: planCode }).$promise;

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_upgrading"),
            "upgrading")
            .then(function (response) {
                return handleTask(response.taskId);
            });
    }

    self.serviceInfos = function () {

        self.flags.init.serviceInfos = true;

        var promise = OvhApiDeskaasService.v6().serviceInfos({ serviceName: $stateParams.serviceName }).$promise;

        return handleMethodCall(
            promise,
            function (response) {
                self.services = response;
            }
        )
            .finally(function () {
                self.flags.init.serviceInfos = false;
            });

    };

    self.hasValidAlias = function () {
        var alias = _.get(self, "details.alias", "noAlias");
        return alias && alias !== "noAlias";
    };

    self.changeAlias = function () {
        ControllerHelper.modal.showNameChangeModal({
            serviceName: self.details.serviceName,
            displayName: self.details.alias !== "noAlias" ? self.details.alias : ""
        })
            .then(newDisplayName => {
                changeAlias(newDisplayName).catch(function (err) {
                    const msg = _.get(err, "data.message", "");
                    CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function changeAlias (newDisplayName ) {

        var promise;

        if (newDisplayName) {
            promise = OvhApiDeskaasService.v6().changeAlias({ serviceName: $stateParams.serviceName }, { alias: newDisplayName }).$promise;
        } else {
            return $q.when();
        }

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_alias_changing"),
            "changingAlias")
            .then(function (response) {
                handleTask(response.taskId, false);
            });
    }

    self.upgrade = function () {

        $state.go("deskaas.details.upgrade", {
            serviceName: self.serviceName,
            references: self.upgradeOptions
        });
        /*
        var modal = $uibModal.open({
            templateUrl     : "app/deskaas/deskaas-upgrade/deskaas-upgrade.html",
            controller      : "DeskaasUpgradeCtrl",
            controllerAs    : "DeskaasUpgradeCtrl",
            backdrop        : "static",
            size            : "md",
            resolve         : {
                service : function () { return self.serviceName; },
                upgrades: function () { return self.upgradeOptions; }
            }
        });

        modal.result.then(function (modalData) {
            if (_.get(modalData, "planCode", "") !== "") {
                upgradeService(modalData.planCode);
            }
        });*/

    };

    self.changeUsername = function () {

        var modal = $uibModal.open({
            templateUrl     : "app/deskaas/deskaas-change-username/deskaas-change-username.html",
            controller      : "DeskaasChangeUsernameCtrl",
            controllerAs    : "DeskaasChangeUsernameCtrl",
            backdrop        : "static",
            size            : "md",
            resolve         : {
                service : function () { return self.serviceName; }
            }
        });

        modal.result.then(function (modalData) {
            changeUsername(modalData).catch(function (err) {
                var msg = _.get(err, "data.message", "");
                CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));
            });
        });

    };

    self.confirmTerminate = function () {
        return ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/deskaas/deskaas-confirm-terminate/deskaas-confirm-terminate.html",
                controller: "DeskaasConfirmTerminateCtrl",
                controllerAs: "DeskaasConfirmTerminateCtrl",
                backdrop: "static",
                size: "md",
                resolve: {
                    service: function () { return self.serviceName; },
                    token: function () { return $stateParams.token; }
                }
            }
        })
            .then(modalData => {
                confirmTerminate(modalData).catch(function (err) {
                    var msg = _.get(err, "data.message", "");
                    CloudMessage.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function confirmTerminate (terminateParams) {

        var promise;

        if (terminateParams.token && terminateParams.reason) {
            promise = OvhApiDeskaasService.v6().confirmTerminate({ serviceName: $stateParams.serviceName }, { token: terminateParams.token, reason: terminateParams.reason, commentary: terminateParams.commentary }).$promise;
        } else {
            return $q.when();
        }

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_terminate_confirming"),
            "confirmingTerminate")
            .then(function (response) {
                handleTask(response.taskId, true);
            });
    }

    function changeUsername (modalData) {

        var promise;

        if (modalData.newUsername) {
            promise = OvhApiDeskaasService.v6().changeUsername({ serviceName: $stateParams.serviceName }, { username: modalData.newUsername }).$promise;
        } else {
            return $q.when();
        }

        return handleServiceMethodCall(
            promise,
            $translate.instant("vdi_username_changing"),
            "changingUsername")
            .then(function (response) {
                handleTask(response.taskId, true);
            });

    }

    self.getDetails = function () {

        self.flags.init.details = true;

        var promise = DeskaasService.getDetails($stateParams.serviceName);

        return handleMethodCall(
            promise,
            function (response) {
                response.displayName = response.alias === "noAlias" ? response.serviceName : response.alias;
                self.services.offer = _.get(self.references[response.planCode], "name");
                self.details = response;
            }
        )
            .finally(function () {
                self.flags.init.details = false;
            });

    };

    self.getUser = function () {

        self.flags.init.user = true;

        var promise = OvhApiDeskaasService.v6().getUser({ serviceName: $stateParams.serviceName }).$promise;

        return handleMethodCall(
            promise,
            function (response) {
                self.user = response;
            }
        )
            .finally(function () {
                self.flags.init.user = false;
            });
    };

    self.taskBackgroud = function (task) {
        if (task.state === "error") {
            return "bg-danger";
        }
        if (task.state === "todo") {
            return "bg-info";
        }
        if (task.state === "done") {
            return "bg-success";
        }
        return "bg-warning";
    };

    function updateTasksStatus (taskDetail, isUserTask) {
        self.tasksHandler.addOrUpdate(taskDetail, isUserTask);
    }

    function handleTask (taskId, isUserTask) {
        return OvhApiDeskaasService.v6()
            .getTask({ serviceName: $stateParams.serviceName, taskId: taskId }, null).$promise
            .then(function (taskDetails) {
                updateTasksStatus(taskDetails, isUserTask);
            });
    }

    function getInitTasks (taskIds) {
        if (taskIds.length === 0) {
            self.flags.init.getTasks = false;
            return $q.when();
        } else if (taskIds.length > 1) {
            return OvhApiDeskaasService.v6()
                .getTaskBatch({ serviceName: $stateParams.serviceName, taskId: taskIds }, null).$promise
                .then(function (tasksDetails) {
                    tasksDetails.forEach(function (taskDetail) {
                        updateTasksStatus(taskDetail.value);
                    });
                    self.flags.init.getTasks = false;
                });
        } else {
            return OvhApiDeskaasService.v6()
                .getTask({ serviceName: $stateParams.serviceName, taskId: taskIds }, null).$promise
                .then(function (tasksDetail) {
                    updateTasksStatus(tasksDetail);
                    self.flags.init.getTasks = false;
                });
        }
    }

    function onTaskError (taskDetails) {

        if (!_.isEmpty(taskDetails)) {
            CloudMessage.error($translate.instant("vdi_task_error", taskDetails));
        } else {
            CloudMessage.error($translate.instant("common_api_error"));
        }

        self.flags.restoring = false;
        self.flags.deleting = false;
        self.flags.upgrading = false;
        self.flags.resettingPassword = false;
        //self.flags.error = true;

    }

    function onTaskSuccess (taskDetails) {

        switch (taskDetails.name) {

        case DESKAAS_ACTIONS.RESTORE:
            self.flags.restoring = false;
            CloudMessage.success($translate.instant("vdi_restored"));
            break;

        case DESKAAS_ACTIONS.REBOOT:
            self.flags.rebooting = false;
            CloudMessage.success($translate.instant("vdi_rebooted"));
            break;

        case DESKAAS_ACTIONS.DELETE:
            self.flags.deleting = false;
            CloudMessage.success($translate.instant("vdi_deleted"));
            break;

        case DESKAAS_ACTIONS.UPGRADE:
            self.flags.upgrading = false;
            CloudMessage.success($translate.instant("vdi_upgraded"));
            break;

        case DESKAAS_ACTIONS.UPDATE_USER_PWD:
            self.flags.resettingPassword = false;
            CloudMessage.success($translate.instant("vdi_pwd_resetted"));
            break;

        case DESKAAS_ACTIONS.UPDATE_ALIAS:
            self.flags.changingAlias = false;
            CloudMessage.success($translate.instant("vdi_alias_changed"));
            break;

        case DESKAAS_ACTIONS.UPDATE_USERNAME:
            self.flags.changingUsername = false;
            CloudMessage.success($translate.instant("vdi_username_changed"));
            break;

        case DESKAAS_ACTIONS.CONSOLE_ACCESS:
            CloudMessage.success($translate.instant("vdi_console_done"));
            break;
        }

        reinit(taskDetails.name);
    }

    function reinit (taskName) {

        switch (taskName) {

        case DESKAAS_ACTIONS.RESTORE:
        case DESKAAS_ACTIONS.REBOOT:
        case DESKAAS_ACTIONS.DELETE:
        case DESKAAS_ACTIONS.UPDATE_USER_PWD:
            //do nothing
            break;

        case DESKAAS_ACTIONS.UPGRADE:
            init(false);
            break;

        case DESKAAS_ACTIONS.UPDATE_ALIAS:
        case DESKAAS_ACTIONS.UPDATE_USERNAME:
            self.getDetails()
                .then(() => {
                    self.changeMenuTitle(self.details.serviceName, self.details.alias !== "noAlias" ? self.details.alias : self.details.serviceName);
                });
            break;
        }

    }

    self.changeMenuTitle = function (serviceName, displayName) {
        const menuItem = SidebarMenu.getItemById(serviceName);
        if (menuItem) {
            menuItem.title = displayName;
        }
    }

    self.getRunningTasks = function () {

        self.flags.init.getTasks = true;

        return $q.all([

            OvhApiDeskaasService.v6().getAllTasks({ serviceName: $stateParams.serviceName }, null).$promise,
            OvhApiDeskaasService.v6().getDoneTasks({ serviceName: $stateParams.serviceName }, null).$promise,
            OvhApiDeskaasService.v6().getCanceledTasks({ serviceName: $stateParams.serviceName }, null).$promise

        ]).then(function (elements) {

            var tasks = elements[0];

            tasks = _.difference(tasks, elements[1]);
            tasks = _.difference(tasks, elements[2]);

            return tasks;

        }).then(function (runningTasks) {
            getInitTasks(runningTasks);
        });
    };

    function init (initTasks) {
        self.tasksHandler = new TasksHandler();

        self.serviceName = $stateParams.serviceName;
        self.token       = $stateParams.token;

        self.flags.init.serviceInfos = true;
        self.flags.init.details = true;
        self.loadMessage();

        $q.all([
            self.serviceInfos().then(function () {
                self.getDetails().then(function () {
                    DeskaasService.getMe().then(me => {
                        self.OrderPlanOffers = DeskaasService.fetchProductPlans(me);
                    });
                    if (self.services.status === "ok") {
                        self.flags.init.getTasks = true;
                        self.flags.init.user = true;
                        $q.all([
                            handleCancelConfirmation(),
                            initTasks ? self.getRunningTasks() : $q.when(),
                            self.getUser(),
                            $stateParams.followTask ? handleTask($stateParams.followTask) : $q.when()
                        ]);
                    }
                });
            }),
        ]);

    }

    function handleCancelConfirmation () {
        if ($stateParams.action === "confirmTerminate") {
            return self.confirmTerminate($stateParams.serviceName);
        }
    }

    init(true);

});
