class IpLoadBalancerActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    showFailoverIpDetail (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/modal/failover-ip/iplb-failover-ip-detail.html",
                controller: "IpLoadBalancerFailoverIpDetailCtrl",
                controllerAs: "IpLoadBalancerFailoverIpDetailCtrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    showNatIpDetail (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/modal/nat-ip/iplb-nat-ip-detail.html",
                controller: "IpLoadBalancerNatIpDetailCtrl",
                controllerAs: "IpLoadBalancerNatIpDetailCtrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    nameChange (serviceName, successHandler) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/modal/service-name/iplb-name-change.html",
                controller: "IpLoadBalancerNameChangeCtrl",
                controllerAs: "IpLoadBalancerNameChangeCtrl",
                resolve: {
                    serviceName: () => serviceName
                }
            },
            successHandler
        });
    }

    cipherChange (serviceName, successHandler) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/modal/cipher/iplb-cipher-change.html",
                controller: "IpLoadBalancerCipherChangeCtrl",
                controllerAs: "IpLoadBalancerCipherChangeCtrl",
                resolve: {
                    serviceName: () => serviceName
                }
            },
            successHandler
        });
    }

    offerChange (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/modal/offer/iplb-offer-change.html",
                controller: "IpLoadBalancerOfferChangeCtrl",
                controllerAs: "IpLoadBalancerOfferChangeCtrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    deleteFrontend (serviceName, frontend) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/frontends/delete/iplb-frontends-delete.html",
                controller: "IpLoadBalancerFrontendDeleteCtrl",
                controllerAs: "IpLoadBalancerFrontendDeleteCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    frontend: () => frontend
                }
            }
        }).result;
    }

    deleteFarm (serviceName, farm) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/serverFarm/delete/iplb-server-farm-delete.html",
                controller: "IpLoadBalancerServerFarmDeleteCtrl",
                controllerAs: "IpLoadBalancerServerFarmDeleteCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    farm: () => farm
                }
            }
        }).result;
    }

    deleteServer (serviceName, farm, server) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/server/delete/iplb-server-delete.html",
                controller: "IpLoadBalancerServerDeleteCtrl",
                controllerAs: "IpLoadBalancerServerDeleteCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    farm: () => farm,
                    server: () => server
                }
            }
        }).result;
    }

    updateCertificate (serviceName, ssl) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/sslCertificate/update/iplb-ssl-certificate-update.html",
                controller: "IpLoadBalancerSslCertificateUpdateCtrl",
                controllerAs: "IpLoadBalancerSslCertificateUpdateCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    ssl: () => ssl
                }
            }
        }).result;
    }

    deleteCertificate (serviceName, ssl) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/sslCertificate/delete/iplb-ssl-certificate-delete.html",
                controller: "IpLoadBalancerSslCertificateDeleteCtrl",
                controllerAs: "IpLoadBalancerSslCertificateDeleteCtrl",
                resolve: {
                    serviceName: () => serviceName,
                    ssl: () => ssl
                }
            }
        }).result;
    }
}

angular.module("managerApp").service("IpLoadBalancerActionService", IpLoadBalancerActionService);
