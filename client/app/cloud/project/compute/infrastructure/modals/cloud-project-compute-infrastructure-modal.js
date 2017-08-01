angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.compute.infrastructure.modal", {
                url: "/modal",
                controller: "CloudProjectComputeInfrastructureModalCtrl",
                controllerAs: "Ctrl",
                views: {
                    cloudProjectInfrastructureModal: {
                        template: "<div ui-view=\"cloudProjectInfrastructureModalContent\"></div>"
                    }
                },
                abstract: true
            });
    });
