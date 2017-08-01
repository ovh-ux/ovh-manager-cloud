angular.module("managerApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("iaas.pci-project.compute.infrastructure.modal.login-information", {
                parent: "iaas.pci-project.compute.infrastructure.modal",
                url: "/loginInformation/{instanceId}",
                views: {
                    cloudProjectInfrastructureModalContent: {
                        template: "",
                        controller: "CloudProjectComputeInfrastructureModalLoginInformationCtrl",
                        controllerAs: "CloudProjectComputeInfrastructureModalLoginInformationCtrl"
                    }
                },
                params: {
                    ipAddresses: false,
                    image: false,
                },
                translations: [
                    "cloud/project/compute/infrastructure/virtualMachine/loginInformation",
                    "cloud/project/compute/infrastructure/modals/loginInformation"
                ]
            });
    });
