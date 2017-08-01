class IpLoadBalancerSslCertificateCtrl {
    constructor ($stateParams, ControllerHelper, IpLoadBalancerActionService, IpLoadBalancerSslCertificateService) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerActionService = IpLoadBalancerActionService;
        this.IpLoadBalancerSslCertificateService = IpLoadBalancerSslCertificateService;
    }

    $onInit () {
        this.init();
    }

    init () {
        this.loading = true;
        this.IpLoadBalancerSslCertificateService.getCertificates(this.$stateParams.serviceName)
            .then(results => {
                this.loading = false;
                this.certificates = results;
            });
    }

    update (ssl) {
        return this.IpLoadBalancerActionService.updateCertificate(this.$stateParams.serviceName, ssl)
            .then(() => {
                this.init();
            });
    }

    delete (ssl) {
        return this.IpLoadBalancerActionService.deleteCertificate(this.$stateParams.serviceName, ssl)
            .then(() => {
                this.init();
            });
    }

    preview (ssl) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/sslCertificate/preview/iplb-ssl-certificate-preview.html",
                controller: "IpLoadBalancerSslCertificatePreviewCtrl",
                controllerAs: "IpLoadBalancerSslCertificatePreviewCtrl",
                resolve: {
                    ssl: () => ssl
                }
            }
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
                                data-ng-bind="'iplb_ssl_see' | translate"
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
                                data-ng-bind="'iplb_ssl_update' | translate"
                                data-ng-click="ctrl.update($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-trash_line"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'iplb_ssl_delete' | translate"
                                data-ng-click="ctrl.delete($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateCtrl", IpLoadBalancerSslCertificateCtrl);
