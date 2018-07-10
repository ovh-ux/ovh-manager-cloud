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
            <oui-action-menu data-align="end" data-compact>
                <oui-action-menu-item
                    data-text="{{'iplb_ssl_see' | translate}}"
                    data-on-click="ctrl.preview($row)">
                </oui-action-menu-item>
                <oui-action-menu-divider></oui-action-menu-divider>
                <oui-action-menu-item
                    data-text="{{'iplb_ssl_update' | translate}}"
                    data-on-click="ctrl.update($row)">
                </oui-action-menu-item>
                <oui-action-menu-item
                    data-text="{{'iplb_ssl_delete' | translate}}"
                    data-on-click="ctrl.delete($row)">
                </oui-action-menu-item>
            </oui-action-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateCtrl", IpLoadBalancerSslCertificateCtrl);
