class VpsBackupStorageCtrl {
    constructor ($stateParams, ControllerHelper, VpsActionService, VpsService) {
        this.serviceName = $stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;
    }

    initLoaders () {
        this.backup = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getBackupStorageTab(this.serviceName)
        });
        this.info = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getBackupStorageInformation(this.serviceName)
        });
        this.vps = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getSelectedVps(this.serviceName)
        });
    }

    $onInit () {
        this.initLoaders();

        this.backup.load();
        this.info.load()
            .then(() => {
                if (!this.info.data.activated) {
                    this.vps.load();
                }
            });
    }

    add () {
        this.VpsActionService.addBackupStorage(this.serviceName)
            .then(() => this.backup.load());
    }

    resetPassword () {
        this.VpsActionService.resetPasswordBackupStorage(this.serviceName);
    }

    deleteOne (access) {
        this.VpsActionService.deleteBackupStorage(this.serviceName, access)
            .then(() => this.backup.load());
    }

    editOne (row) {
        this.VpsActionService.editBackupStorage(this.serviceName, row)
            .then(() => this.backup.load());
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
