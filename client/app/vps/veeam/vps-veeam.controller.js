class VpsVeeamCtrl {
    constructor ($stateParams, $translate, CloudMessage, VpsActionService ,VpsService) {
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            veeamTab: false
        };
        this.veeam = {};
        this.veeamTab = {};

        this.vps = {
            canOrder: true
        };

    }

    $onInit () {
        this.loadVeeam();
    }

    loadVeeamTab () {
        this.loaders.veeamTab = true;
        this.VpsService.getTabVeeam("available", true)
            .then(data => { this.veeamTab = data})
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.veeamTab = false });
    }

    loadRestorePoint () {
        this.loaders.veeamTab = true;
        this.VpsService.getTabVeeam("restoring", false)
            .then(data => {
                if (data.length) {
                    this.veeam.state = "MOUNTING";
                    this.veeam.restorePoint = data[0];
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.veeamTab = false });
    }

    loadVeeam () {
        this.loaders.init = true;
        this.VpsService.getVeeam()
            .then(data => {
                this.veeam = data;
                if (data.state !== "disabled") {
                    this.loadVeeamTab();
                    this.loadRestorePoint();
                } else {
                    this.checkOrder();
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    checkOrder () {
        this.VpsService.getSelectedVps(this.serviceName)
            .then((vps) => {this.vps.canOrder = vps.canOrder})
            .catch(err => this.CloudMessage.error(err));
    }

    displayDate (date) {
        return moment(date).format('LLL');
    }

    restore (restorePoint) {
        this.VpsActionService.restore(restorePoint);
    }

    mount (restorePoint) {
        this.VpsActionService.mount(restorePoint);
    }

    dateTemplate () {
        return `<span data-ng-bind="$ctrl.displayDate($row)"></span>`
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
