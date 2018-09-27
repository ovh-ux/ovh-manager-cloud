angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube.containers", {
                url: "/containers",
                views: {
                    kubernetesView: {
                        component: "kubernetesContainer"
                    }
                },
                resolve: {
                    serviceName: $transition$ => $transition$.params().serviceName
                },
                translations: ["common", "kubernetes"]
            });
    });
