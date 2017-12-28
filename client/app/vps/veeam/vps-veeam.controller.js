class VpsVeeamCtrl {
    constructor ($stateParams, $translate, CloudMessage, ControllerHelper, VpsActionService, VpsService) {
        this.serviceName = $stateParams.serviceName;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            checkOrder: false,
            veeamTab: false
        };

        this.vps = {
            hasVeeam: false,
            canOrder: false
        };

    }

    initLoaders () {
        this.veeam = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getVeeam(this.serviceName)
        });
        this.veeamTab = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getTabVeeam(this.serviceName, "available", true)
        });
        this.vps = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.VpsService.getSelectedVps(this.serviceName)
        });
    }

    $onInit () {
        this.initLoaders();
        this.veeam.load().then(() => {
            if (this.veeam.data.state !== "disabled") {
                this.veeamTab.load();
                this.loadRestorePoint();
            } else {
                this.vps.load();
            }
        });
    }

    loadRestorePoint () {
        this.veeamTab.loading = true;
        this.VpsService.getTabVeeam(this.serviceName, "restoring", false)
            .then(data => {
                if (data.length) {
                    this.veeam.data.state = "MOUNTING";
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.veeamTab.loading = false; });
    }

    restore (restorePoint) {
        this.VpsActionService.restore(this.serviceName, restorePoint);
    }

    mount (restorePoint) {
        this.VpsActionService.mount(this.serviceName, restorePoint);
    }

    unmount (restorePoint) {
        this.VpsActionService.unmount(this.serviceName, restorePoint);
    }

    dateTemplate () {
        return `<span data-ng-bind="$row | momentFormat:'LLL'"></span>`;
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
                                data-translate="vps_tab_VEEAM_dashboard_table_header_restore"
                                data-ng-click="$ctrl.restore($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-translate="vps_tab_VEEAM_dashboard_table_header_mount"
                                data-ng-click="$ctrl.mount($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>
        `;
    }

}

angular.module("managerApp").controller("VpsVeeamCtrl", VpsVeeamCtrl);
