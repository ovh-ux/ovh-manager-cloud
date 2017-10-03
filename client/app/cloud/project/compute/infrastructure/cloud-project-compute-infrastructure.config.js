angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectComputeInfrastructureCtrl: {
                initInfra (atInternet, controller) {
                    controller.Cloud.Project().Lexi().query().$promise
                        .then(projects => {
                            atInternet.trackEvent({
                                event: `CloudProject-${projects.length}`,
                                page: "cloud::iaas::pci-project::compute::infrastructure"
                            });
                        });
                }
            }
        });
    });
