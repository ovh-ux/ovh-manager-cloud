class CloudDbHomeCtrl {
    constructor ($scope, $state, $stateParams, $translate, CloudDbActionService, CloudDbHomeService, CloudDbInstanceService, CloudPoll, ControllerHelper, ControllerModalHelper) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbHomeService = CloudDbHomeService;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;
        this.ControllerModalHelper = ControllerModalHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.$scope.$on("$destroy", () => this.stopTaskPolling());
        this.initLoaders();
        this.initActions();
    }

    $onInit () {
        this.instance.load();
        this.status.load();
        this.access.load();
        this.configuration.load();
    }

    initLoaders () {
        this.status = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbHomeService.getStatus(this.projectId, this.instanceId)
        });

        this.access = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbHomeService.getAccess(this.projectId, this.instanceId)
        });

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbHomeService.getConfiguration(this.projectId, this.instanceId)
        });

        this.instance = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbInstanceService.getInstance(this.projectId, this.instanceId, { resetCache: true }),
            successHandler: () => {
                if (this.instance.data.taskId) {
                    this.startTaskPolling();
                }
            }
        });
    }

    startTaskPolling () {
        this.stopTaskPolling();

        this.poller = this.CloudPoll.poll({
            item: this.instance.data,
            pollFunction: () => this.CloudDbInstanceService.getInstance(this.projectId, this.instanceId, { resetCache: true }),
            stopCondition: instance => !_.get(instance, "task.id") || _.includes(["done", "error"], instance.task.status)
        });

        this.poller.$promise
            .then(() => {
                this.$onInit();
            });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    initActions () {
        this.actions = {
            addDataBase: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_database"),
                callback: () => this.$state.go("dbaas.cloud-db.instance.detail.database.add", { projectId: this.projectId, instanceId: this.instanceId }),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            addUser: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_user"),
                callback: () => this.$state.go("dbaas.cloud-db.instance.detail.user.add", { projectId: this.projectId, instanceId: this.instanceId }),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            addBackup: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_backup"),
                callback: () => this.CloudDbActionService.showBackupEditModal(this.projectId, this.instanceId),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            addNetwork: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_add_network"),
                callback: () => this.CloudDbActionService.showNetworkEditModal(this.projectId, this.instanceId),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            restartInstance: {
                text: this.$translate.instant("cloud_db_home_tile_status_instance_restart"),
                callback: () => this.CloudDbActionService.showInstanceRestartModal(this.projectId, this.instanceId),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            editName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.ControllerModalHelper.showNameChangeModal({
                    serviceName: this.instanceId,
                    displayName: this.configuration.data.displayName,
                    onSave: newDisplayName => this.CloudDbHomeService.updateName(this.projectId, this.instanceId, newDisplayName).then(() => {
                        this.status.load();
                        this.configuration.load();
                        this.instance.load();
                    })
                }),
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            editAdvancedParameters: {
                text: this.$translate.instant("common_edit"),
                state: "dbaas.cloud-db.instance.detail.advanced-parameter.update",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => !this.instance.loading && !this.instance.data.taskId
            },
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { projectId: this.projectId, serviceType: "CLOUD_DB" }),
                isAvailable: () => true
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { projectId: this.projectId }),
                isAvailable: () => true
            }
        };
    }
}

angular.module("managerApp").controller("CloudDbHomeCtrl", CloudDbHomeCtrl);
