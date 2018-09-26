angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.kube.nodes", {
                url: "/nodes",
                views: {
                    kubernetesView: {
                        templateUrl: "app/kubernetes/nodes/kubernetes-nodes.html",
                        controller: "KubernetesNodesCtrl",
                        controllerAs: "$ctrl"
                    }
                },
                translations: ["common", "kubernetes"]
            });
    });
