(() => {
    const iplbHeader = {
        templateUrl: "app/iplb/header/iplb-dashboard-header.html",
        controller: "IpLoadBalancerDashboardHeaderCtrl",
        controllerAs: "ctrl"
    };

    angular.module("managerApp").config($stateProvider => {
        $stateProvider
            .state("network.iplb.detail.ssl-certificate", {
                url: "/sslCertificate",
                views: {
                    iplbHeader,
                    iplbContent: {
                        templateUrl: "app/iplb/sslCertificate/iplb-ssl-certificate.html",
                        controller: "IpLoadBalancerSslCertificateCtrl",
                        controllerAs: "ctrl"
                    }
                },
                translations: ["common", "iplb", "iplb/sslCertificate"]
            })
            .state("network.iplb.detail.ssl-certificate.add", {
                parent: "network.iplb.detail",
                url: "/sslCertificate/add",
                views: {
                    iplbHeader,
                    iplbContent: {
                        templateUrl: "app/iplb/sslCertificate/iplb-ssl-certificate-edit.html",
                        controller: "IpLoadBalancerSslCertificateEditCtrl",
                        controllerAs: "ctrl"
                    }
                },
                onEnter: CloudMessage => CloudMessage.flushMessages(),
                translations: ["common", "iplb", "iplb/sslCertificate"]
            });
    });
})();
