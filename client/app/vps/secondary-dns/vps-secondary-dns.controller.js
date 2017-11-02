class VpsSecondaryDnsCtrl {
    constructor (VpsActionService ,VpsService) {
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false
        };
        this.secondaryDns = {};

    }

    $onInit () {
        this.loaders.init = true;
        this.loadSecondaryDns();
    }

    loadSecondaryDns () {
        this.VpsService.getTabSecondaryDns()
            .then(data => { this.secondaryDns = data })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false })
    }

    add () {
        this.VpsActionService.addSecondaryDns();
    }

    deleteOne (domain) {
        this.VpsActionService().deleteSecondaryDns(domain);
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
                                data-ng-click="$ctrl.delete($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>
        `;
    }

}

angular.module("managerApp").controller("VpsSecondaryDnsCtrl", VpsSecondaryDnsCtrl);
