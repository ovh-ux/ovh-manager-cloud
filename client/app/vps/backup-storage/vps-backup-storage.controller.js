class VpsBackupStorageCtrl {
    constructor ($translate, CloudMessage, VpsActionService ,VpsService) {
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            information: false
        };
        this.backup = {};

    }

    $onInit () {
        this.loadInformation ();
        this.loadBackup();
    }

    loadInformation () {
        this.loaders.information = true;
        this.VpsService.getBackupStorageInformation()
            .then((backupInfo) => {
                this.backup.information = backupInfo;
                if (backupInfo.activated === true && backupInfo.quota) {
                    if (backupInfo.usage === 0) {
                        backupInfo.usage = {
                            unit: "%",
                            value: 0
                        };
                    }
                    this.backup.use = backupInfo.usage.value * backupInfo.quota.value / 100;
                }
            })
            .catch((err) => { this.CloudMessage.error(err) })
            .finally(() => {
                this.loaders.information = false;
            });
    }

    loadBackup () {
        this.loaders.init = true;
        this.VpsService.getBackupStorageTab()
            .then(data => { this.backup.table = data })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    getStatus (isApplied) {
        if (isApplied) {
            return this.$translate.instant("vps_tab_backup_storage_table_ip_enable");
        }
        return this.$translate.instant("vps_tab_backup_storage_table_ip_disable");
    }

    add () {
        this.VpsActionService.addSecondaryDns();
    }

    deleteOne (domain) {
        this.VpsActionService.deleteSecondaryDns(domain);
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
                                data-translate="common_delete"
                                data-ng-click="$ctrl.deleteOne($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>
        `;
    }

}

angular.module("managerApp").controller("VpsBackupStorageCtrl", VpsBackupStorageCtrl);
