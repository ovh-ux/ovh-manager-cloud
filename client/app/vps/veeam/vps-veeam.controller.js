class VpsVeeamCtrl {
    constructor ($translate, CloudMessage, VpsActionService ,VpsService) {
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.loaders = {
            init: false,
            veeamTab: false
        };
        this.veeam = {};
        this.veeamTab = {};

    }

    $onInit () {
        this.loadVeeam();
        this.loadVeeamTab();
    }

    loadVeeamTab () {
        this.loaders.veeamTab = true;
        this.VpsService.getTabVeeam("available", true)
            .then(data => { this.veeamTab = data})
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.veeamTab = false });
    }

    loadVeeam () {
        this.loaders.init = true;
        this.VpsService.getVeeam()
            .then(data => { this.veeam = data })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
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

angular.module("managerApp").controller("VpsVeeamCtrl", VpsVeeamCtrl);
