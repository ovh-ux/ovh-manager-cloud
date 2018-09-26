angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube", {
                url: "/kube/:serviceName",
                templateUrl: "app/kubernetes/kubernetes.html",
                controller: "KubernetesCtrl",
                controllerAs: "$ctrl",
                redirectTo: "paas.kube.service",
                translations: ["common", "kubernetes"]
            });
    });
