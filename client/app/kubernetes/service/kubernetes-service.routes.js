angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube.service", {
                url: "/service",
                views: {
                    kubernetesView: {
                        templateUrl: "app/kubernetes/service/kubernetes-service.html",
                        controller: "KubernetesServiceCtrl",
                        controllerAs: "$ctrl"
                    }
                },
                translations: ["common", "kubernetes"]
            });
    });
