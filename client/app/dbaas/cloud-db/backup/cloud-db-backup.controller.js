class CloudDbBackupCtrl {
    constructor ($scope, $stateParams, $translate, CloudDbActionService, CloudDbBackupService, CloudDbInstanceService, CloudPoll, ControllerHelper) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbBackupService = CloudDbBackupService;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.$scope.$on("$destroy", () => this.stopTaskPolling());

        this.instance = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbInstanceService.getInstance(this.projectId, this.instanceId, { resetCache: true })
        });

        this.backups = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbBackupService.getBackups(this.projectId, this.instanceId),
            successHandler: () => this.startTaskPolling()
        });

        this.initActions();
    }

    $onInit () {
        this.instance.load();
        this.backups.load();
    }

    initActions () {
        this.actions = {
            addBackup: {
                text: this.$translate.instant("cloud_db_backup_add"),
                callback: () => this.CloudDbActionService.showBackupEditModal(this.projectId, this.instanceId)
                    .then(() => this.$onInit()),
                isAvailable: () => !this.instance.loading /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            },
            downloadBackup: {
                text: this.$translate.instant("cloud_db_backup_action_menu_download"),
                callback: backup => console.log("DO SOMETHING", backup.id),
                isAvailable: backup => !this.instance.loading && !backup.taskId /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            },
            restoreBackup: {
                text: this.$translate.instant("cloud_db_backup_action_menu_restore"),
                callback: backup => this.CloudDbBackupService.restoreBackup(this.projectId, this.instanceId, backup.id),
                isAvailable: backup => !this.instance.loading && !backup.taskId /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            },
            deleteBackup: {
                text: this.$translate.instant("common_delete"),
                callback: backup => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("cloud_db_backup_delete_title"),
                    text: this.$translate.instant("cloud_db_backup_delete_confirmation_message")
                })
                    .then(() => this.CloudDbBackupService.deleteBackup(this.projectId, this.instanceId, backup.id))
                    .then(() => this.refreshBackup(backup))
                    .then(() => this.startTaskPolling()),
                isAvailable: backup => !this.instance.loading && !backup.taskId /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            }
        };
    }

    startTaskPolling () {
        this.stopTaskPolling();

        const backupToPoll = _.filter(this.backups.data, backup => backup.taskId && !_.includes(["done", "error"], backup.task.status));
        this.poller = this.CloudPoll.pollArray({
            items: backupToPoll,
            pollFunction: backup => this.CloudDbBackupService.getBackup(this.projectId, this.instanceId, backup.id, { resetCache: true, muteError: true }),
            stopCondition: backup => !_.get(backup, "task.id") || _.includes(["done", "error"], backup.task.status),
            onItemDone: item => {
                if (!item) {
                    this.$onInit();
                }
            }
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    refreshNetwork (network) {
        return this.CloudDbNetworkService.getNetwork(this.projectId, this.instanceId, network.network, { resetCache: true })
            .then(newNetwork => _.merge(network, newNetwork));
    }

    getActionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-disabled="!$ctrl.actions.downloadBackup.isAvailable($row)"
                                data-ng-bind="$ctrl.actions.downloadBackup.text"
                                data-ng-click="$ctrl.actions.downloadBackup.callback(123456)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-disabled="!$ctrl.actions.restoreBackup.isAvailable($row)"
                                data-ng-bind="$ctrl.actions.restoreBackup.text"
                                data-ng-click="$ctrl.actions.restoreBackup.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"> </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_delete' | translate"
                                data-ng-disabled="!$ctrl.actions.deleteBackup.isAvailable($row)"
                                data-ng-click="$ctrl.actions.deleteBackup.callback($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("CloudDbBackupCtrl", CloudDbBackupCtrl);
