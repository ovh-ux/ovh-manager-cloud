class VpsBackupStorageCtrl {
    constructor ($stateParams ,$translate, CloudMessage, VpsActionService, VpsService) {
        this.serviceName = $stateParams.serviceName;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            information: false,
            vps: false
        };
        this.backup = {};
        this.vps = {};

    }

    $onInit () {
        this.loadInformation ();
        this.loadBackup();
    }

    loadVps () {
        this.loaders.vps = true;
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => {
                this.vps = vps;
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.vps = false });
    }

    loadInformation () {
        this.loaders.information = true;
        this.VpsService.getBackupStorageInformation(this.serviceName)
            .then(backupInfo => {
                this.backup.information = backupInfo;
                if (backupInfo.activated === true && backupInfo.quota) {
                    if (backupInfo.usage === 0) {
                        backupInfo.usage = {
                            unit: "%",
                            value: 0
                        };
                    }
                }
                if (!backupInfo.activated) {
                    this.loadVps();
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => {
                this.loaders.information = false;
            });
    }

    loadBackup () {
        this.loaders.init = true;
        this.VpsService.getBackupStorageTab(this.serviceName)
            .then(data => { this.backup.table = data })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    add () {
        this.VpsActionService.addBackupStorage(this.serviceName)
            .then(() => this.loadBackup());
    }

    resetPassword () {
        this.VpsActionService.resetPasswordBackupStorage(this.serviceName);
    }

    deleteOne (access) {
        this.VpsActionService.deleteBackupStorage(this.serviceName, access)
            .then(() => this.loadBackup());
    }

    editOne (row) {
        this.VpsActionService.editBackupStorage(this.serviceName, row)
            .then(() => this.loadBackup());
    }

    activationStatusTemplate () {
        return `
            <td class="center">
                <span data-ng-show="$row.isApplied" data-translate="vps_tab_backup_storage_table_ip_enable"></span>
                <span data-ng-hide="$row.isApplied" data-translate="vps_tab_backup_storage_table_ip_disable"></span>
        </td>`;
    }

    actionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-translate="common_edit"
                                data-ng-click="$ctrl.editOne($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-translate="common_delete"
                                data-ng-click="$ctrl.deleteOne($row.ipBlock)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>
        `;
    }

}

angular.module("managerApp").controller("VpsBackupStorageCtrl", VpsBackupStorageCtrl);
