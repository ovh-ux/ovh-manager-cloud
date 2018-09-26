angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube.containers", {
                url: "/containers",
                views: {
                    kubernetesView: {
                        templateUrl: "app/kubernetes/containers/kubernetes-containers.html"
                    }
                },
                translations: ["common", "kubernetes"]
            });
    });
