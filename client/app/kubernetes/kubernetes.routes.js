angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube", {
                url: "/kube/:serviceName",
                component: "kubernetes",
                params: { serviceName: null },
                resolve: {
                    serviceName: $transition$ => $transition$.params().serviceName
                },
                redirectTo: "paas.kube.service",
                translations: ["common", "kubernetes"]
            });
    });
