"use strict";

angular.module("managerApp").controller("DeskaasDetailsCtrl", function (OvhApiDeskaasService, ControllerHelper, $stateParams, $scope, Toast, $translate, $state, $q, ACTIONS, $uibModal, OvhApiMe, deskaasSidebar) {

    var self = this;

    self.services = {};
    self.details = {};
    self.user = {};
    self.upgradeOptions = [];
    self.selectedUpgrade = "";
    self.tasksHandler = null;

    self.references = {
        "clouddesktop1" : { "name": "Cloud Desktop 1", "vcpu": 1, "ram": 2, "storage": 10, "gpu": 0, "planCode": "clouddesktop1", "upgrades": ["clouddesktop2", "clouddesktop3"] },
        "clouddesktop2" : { "name": "Cloud Desktop 2", "vcpu": 2, "ram": 4, "storage": 50, "gpu": 0, "planCode": "clouddesktop2", "upgrades": ["clouddesktop3"] },
        "clouddesktop3" : { "name": "Cloud Desktop 3", "vcpu": 4, "ram": 16, "storage": 100, "gpu": 0, "planCode": "clouddesktop3", "upgrades": [] },
        "clouddesktop4" : { "name": "Cloud Desktop GPU", "vcpu": 4, "ram": 16, "storage": 100, "gpu": 1, "planCode": "clouddesktop4", "upgrades": [] }
    };

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
            isAvailable: () => self.flags.editable()
        },
        changeAlias: {
            text: $translate.instant("common_modify"),
            callback: () => self.changeAlias($stateParams.serviceName),
            isAvailable: () => self.flags.editable()
        }
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
                Object.keys(ACTIONS).forEach(function (taskName) {
                    _allowedTask.push(ACTIONS[taskName]);
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
                if (value.name !== ACTIONS.CONSOLE_ACCESS && value.state !== "done" && value.state !== "canceled") {
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
            if (!self.flags.init.getTasks && !self.flags.upgrading && typeof(self.details.planCode) !== "undefined" && self.OrderPlanOffers.length !== 0) {
                var curRef = self.references[self.details.planCode];
                if (typeof(curRef) !== "undefined") {
                    curRef.upgrades.forEach(function (upgrade) {
                        self.references[upgrade].priceText = self.OrderPlanOffers[upgrade].priceText;
                        ref.push(self.references[upgrade]);
                    });
                } else {
                    console.log("Error: PlanCode " + self.details.planCode + " not known");
                }
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
                Toast.error([$translate.instant("common_api_error"), msg].join(" "));
                return $q.reject(err);
            });
    }

    function handleServiceMethodCall (promise, successMessage, flagName) {

        self.flags[flagName] = true;

        return handleMethodCall(
            promise,
            function (response) {
                Toast.success(successMessage);
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
                    Toast.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function getConsole () {
        var promise;

        promise = OvhApiDeskaasService.Lexi().console({ serviceName: $stateParams.serviceName }, null).$promise;

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
                var promise = OvhApiDeskaasService.Lexi().deleteService({ serviceName: $stateParams.serviceName }, null).$promise;

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
                    Toast.error([$translate.instant("common_api_error"), msg].join(" "));

                });

        });

    };

    function resetPassword (passwordParams) {

        var promise;

        if (passwordParams.generatePwd) {
            promise = OvhApiDeskaasService.Lexi().resetPassword({ serviceName: $stateParams.serviceName }, null).$promise;
        } else if (passwordParams.password) {
            promise = OvhApiDeskaasService.Lexi().resetPassword({ serviceName: $stateParams.serviceName }, { password: passwordParams.password }).$promise;
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
                var promise = OvhApiDeskaasService.Lexi().restoreService({ serviceName: $stateParams.serviceName }, null).$promise;

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
                var promise = OvhApiDeskaasService.Lexi().rebootService({ serviceName: $stateParams.serviceName }, null).$promise;

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

        var promise = OvhApiDeskaasService.Lexi().upgradeService({ serviceName: $stateParams.serviceName }, { planCode: planCode }).$promise;

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

        var promise = OvhApiDeskaasService.Lexi().serviceInfos({ serviceName: $stateParams.serviceName }).$promise;

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
            displayName: self.details.alias !== "no-alias" ? self.details.alias : ""
        })
            .then(newDisplayName => {
                changeAlias(newDisplayName).catch(function (err) {
                    const msg = _.get(err, "data.message", "");
                    Toast.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function changeAlias (newDisplayName ) {

        var promise;

        if (newDisplayName) {
            promise = OvhApiDeskaasService.Lexi().changeAlias({ serviceName: $stateParams.serviceName }, { alias: newDisplayName }).$promise;
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
        });

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
                Toast.error([$translate.instant("common_api_error"), msg].join(" "));
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
                    Toast.error([$translate.instant("common_api_error"), msg].join(" "));
                });
            });
    };

    function confirmTerminate (terminateParams) {

        var promise;

        if (terminateParams.token && terminateParams.reason) {
            promise = OvhApiDeskaasService.Lexi().confirmTerminate({ serviceName: $stateParams.serviceName }, { token: terminateParams.token, reason: terminateParams.reason, commentary: terminateParams.commentary }).$promise;
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
            promise = OvhApiDeskaasService.Lexi().changeUsername({ serviceName: $stateParams.serviceName }, { username: modalData.newUsername }).$promise;
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

        var promise = OvhApiDeskaasService.Lexi().getDetails({ serviceName: $stateParams.serviceName }).$promise;

        return handleMethodCall(
            promise,
            function (response) {
                response.displayName = response.alias === "noAlias" ? response.serviceName : response.alias;
                self.services.offer = _.get(self.references[response.planCode], "name");
                self.details = response;
                deskaasSidebar.updateItem(self.details);
            }
        )
            .finally(function () {
                self.flags.init.details = false;
            });

    };

    self.getUser = function () {

        self.flags.init.user = true;

        var promise = OvhApiDeskaasService.Lexi().getUser({ serviceName: $stateParams.serviceName }).$promise;

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
        return OvhApiDeskaasService.Lexi()
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
            return OvhApiDeskaasService.Lexi()
                .getTaskBatch({ serviceName: $stateParams.serviceName, taskId: taskIds }, null).$promise
                .then(function (tasksDetails) {
                    tasksDetails.forEach(function (taskDetail) {
                        updateTasksStatus(taskDetail.value);
                    });
                    self.flags.init.getTasks = false;
                });
        } else {
            return OvhApiDeskaasService.Lexi()
                .getTask({ serviceName: $stateParams.serviceName, taskId: taskIds }, null).$promise
                .then(function (tasksDetail) {
                    updateTasksStatus(tasksDetail);
                    self.flags.init.getTasks = false;
                });
        }
    }

    function onTaskError (taskDetails) {

        if (!_.isEmpty(taskDetails)) {
            Toast.error($translate.instant("vdi_task_error", taskDetails));
        } else {
            Toast.error($translate.instant("common_api_error"));
        }

        self.flags.restoring = false;
        self.flags.deleting = false;
        self.flags.upgrading = false;
        self.flags.resettingPassword = false;
        //self.flags.error = true;

    }

    function onTaskSuccess (taskDetails) {

        switch (taskDetails.name) {

        case ACTIONS.RESTORE:
            self.flags.restoring = false;
            Toast.success($translate.instant("vdi_restored"));
            break;

        case ACTIONS.REBOOT:
            self.flags.rebooting = false;
            Toast.success($translate.instant("vdi_rebooted"));
            break;

        case ACTIONS.DELETE:
            self.flags.deleting = false;
            Toast.success($translate.instant("vdi_deleted"));
            break;

        case ACTIONS.UPGRADE:
            self.flags.upgrading = false;
            Toast.success($translate.instant("vdi_upgraded"));
            break;

        case ACTIONS.UPDATE_USER_PWD:
            self.flags.resettingPassword = false;
            Toast.success($translate.instant("vdi_pwd_resetted"));
            break;

        case ACTIONS.UPDATE_ALIAS:
            self.flags.changingAlias = false;
            Toast.success($translate.instant("vdi_alias_changed"));
            break;

        case ACTIONS.UPDATE_USERNAME:
            self.flags.changingUsername = false;
            Toast.success($translate.instant("vdi_username_changed"));
            break;

        case ACTIONS.CONSOLE_ACCESS:
            Toast.success($translate.instant("vdi_console_done"));
            break;
        }

        reinit(taskDetails.name);
    }

    function reinit (taskName) {

        switch (taskName) {

        case ACTIONS.RESTORE:
        case ACTIONS.REBOOT:
        case ACTIONS.DELETE:
        case ACTIONS.UPDATE_USER_PWD:
            //do nothing
            break;

        case ACTIONS.UPGRADE:
            init(false);
            break;

        case ACTIONS.UPDATE_ALIAS:
        case ACTIONS.UPDATE_USERNAME:
            self.getDetails();
            break;
        }

    }

    self.getRunningTasks = function () {

        self.flags.init.getTasks = true;

        return $q.all([

            OvhApiDeskaasService.Lexi().getAllTasks({ serviceName: $stateParams.serviceName }, null).$promise,
            OvhApiDeskaasService.Lexi().getDoneTasks({ serviceName: $stateParams.serviceName }, null).$promise,
            OvhApiDeskaasService.Lexi().getCanceledTasks({ serviceName: $stateParams.serviceName }, null).$promise

        ]).then(function (elements) {

            var tasks = elements[0];
            
            tasks = _.difference(tasks, elements[1]);
            tasks = _.difference(tasks, elements[2]);
            
            return tasks;
            
        }).then(function (runningTasks) {
            getInitTasks(runningTasks);
        });
    };

    // Retrieve me
    function getMe () {
        return OvhApiMe.Lexi().get().$promise;
    }

    function getProductPlans (me) {
        // Use the catalog to get Product for deskaas
        var promise = OvhApiDeskaasService.Lexi().getProducts({ ovhSubsidiary: me.ovhSubsidiary }).$promise;
        promise.then(function (catalog) {
            var newOrderPlanOffers = {};
            catalog.plans.forEach(function (catalogEntry) {
                newOrderPlanOffers[catalogEntry.planCode] = { planCode: catalogEntry.planCode,
                                                              priceInUcents: catalogEntry.details.pricings.default[0].priceInUcents,
                                                              productName: catalogEntry.invoiceName,
                                                              priceText: catalogEntry.details.pricings.default[0].price.text };
            });
            self.OrderPlanOffers = newOrderPlanOffers;
        });
        return promise;
    }

    function init (initTasks) {
        self.tasksHandler = new TasksHandler();

        self.serviceName = $stateParams.serviceName;
        self.token       = $stateParams.token;

        self.flags.init.serviceInfos = true;
        self.flags.init.details = true;

        $q.all([
            self.serviceInfos().then(function () {
                self.getDetails().then(function () {
                    if (self.services.status === "ok") {
                        self.flags.init.getTasks = true;
                        self.flags.init.user = true;
                        $q.all([
                            handleCancelConfirmation(),
                            initTasks ? self.getRunningTasks() : $q.when(),
                            self.getUser()
                        ]);
                    }
                });
            }),
            // FIXME Need the VDI api to get infos
            getMe().then(function (me) {
                getProductPlans(me);
            })
        ]);

    }

    function handleCancelConfirmation () {
        if ($stateParams.action === "confirmTerminate") {
            return self.confirmTerminate($stateParams.serviceName);
        }
    }

    init(true);

});
