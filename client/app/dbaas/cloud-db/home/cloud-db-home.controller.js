class CloudDbHomeCtrl {
    constructor ($state, $stateParams, $translate, CloudDbActionService, CloudDbHomeService, ControllerHelper, ControllerModalHelper) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbHomeService = CloudDbHomeService;
        this.ControllerHelper = ControllerHelper;
        this.ControllerModalHelper = ControllerModalHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.initLoaders();
    }

    $onInit () {
        this.status.load();
        this.access.load();
        this.configuration.load();
        this.initActions();
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
    }

    initActions () {
        this.actions = {
            addDataBase: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_database"),
                state: "dbaas.cloud-db.instance.detail.database.add",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => true
            },
            addUser: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_user"),
                state: "dbaas.cloud-db.instance.detail.user.add",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => true
            },
            addBackup: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_create_backup"),
                callback: () => this.CloudDbActionService.showBackupEditModal(this.projectId, this.instanceId),
                isAvailable: () => true
            },
            addNetwork: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_add_network"),
                callback: () => this.CloudDbActionService.showNetworkEditModal(this.projectId, this.instanceId),
                isAvailable: () => true
            },
            restartInstance: {
                text: this.$translate.instant("cloud_db_home_tile_status_instance_restart"),
                callback: () => this.CloudDbActionService.showInstanceRestartModal(this.projectId, this.instanceId),
                isAvailable: () => true
            },
            editName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.ControllerModalHelper.showNameChangeModal({
                    serviceName: this.instanceId,
                    displayName: this.configuration.data.displayName,
                    onSave: newDisplayName => this.CloudDbHomeService.updateName(this.projectId, this.instanceId, newDisplayName).then(() => {
                        this.status.load();
                        this.configuration.load();
                    })
                }),
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            editAdvancedParameters: {
                text: this.$translate.instant("common_edit"),
                state: "dbaas.cloud-db.instance.detail.advanced-parameter.update",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            changeOffer: {
                text: this.$translate.instant("cloud_db_home_tile_shortcut_change_offer"),
                state: "dbaas.cloud-db.instance.detail.offer.update",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => true
            },
            // TODO => move to project
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
