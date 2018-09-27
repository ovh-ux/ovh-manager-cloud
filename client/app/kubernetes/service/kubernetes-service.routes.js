angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube.service", {
                url: "/service",
                views: {
                    kubernetesView: {
                        component: "kubernetesService"
                    }
                },
                resolve: {
                    serviceName: $transition$ => $transition$.params().serviceName
                },
                translations: ["common", "kubernetes"]
            });
    });
