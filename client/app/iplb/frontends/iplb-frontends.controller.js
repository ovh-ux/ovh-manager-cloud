class IpLoadBalancerFrontendsCtrl {
    constructor ($state, $stateParams, $translate, CloudMessage, ControllerHelper,
                 IpLoadBalancerActionService, IpLoadBalancerFrontendsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerActionService = IpLoadBalancerActionService;
        this.IpLoadBalancerFrontendService = IpLoadBalancerFrontendsService;
    }

    $onInit () {
        this.init();
    }

    init () {
        this.loading = true;
        this.IpLoadBalancerFrontendService.getFrontends(this.$stateParams.serviceName)
            .then(results => {
                this.loading = false;
                this.frontends = results;
            });
    }

    loadFarm (frontend) {
        if (!frontend.defaultFarmId) {
            frontend.defaultFarm = null;
        }
        return this.IpLoadBalancerFrontendService.getFarm(frontend.protocol, this.$stateParams.serviceName, frontend.defaultFarmId)
            .then(farm => ({ defaultFarm: farm }));
    }

    update (frontend) {
        this.$state.go("network.iplb.detail.frontends.update", {
            serviceName: this.$stateParams.serviceName,
            frontendId: frontend.frontendId
        });
    }

    delete (frontend) {
        this.IpLoadBalancerActionService.deleteFrontend(
            this.$stateParams.serviceName,
            frontend
        ).then(() => this.init());
    }

    preview (frontend) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/frontends/preview/iplb-frontends-preview.html",
                controller: "IpLoadBalancerFrontendPreviewCtrl",
                controllerAs: "IpLoadBalancerFrontendPreviewCtrl",
                resolve: {
                    frontend: () => frontend
                }
            }
        });
    }

    toggle (frontend) {
        // frontend.disabled = !frontend.disabled;
        this.IpLoadBalancerFrontendService.toggleFrontend(
            frontend.protocol,
            this.$stateParams.serviceName,
            _.assign({}, frontend, {
                disabled: !frontend.disabled
            })
        ).then(() => {
            // Apply value on model
            frontend.disabled = !frontend.disabled;
        });
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
                                <i class="oui-icon oui-icon-eye"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_preview_see' | translate"
                                data-ng-click="ctrl.preview($row)"></button>
                        </div>
                    </div>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-pen_line"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'iplb_frontend_update' | translate"
                                data-ng-click="ctrl.update($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-trash_line"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'iplb_frontend_delete' | translate"
                                data-ng-click="ctrl.delete($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerFrontendsCtrl", IpLoadBalancerFrontendsCtrl);
