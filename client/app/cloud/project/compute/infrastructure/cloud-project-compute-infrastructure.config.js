angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectComputeInfrastructureDiagramCtrl: {
                initInfra (atInternet, controller) {
                    controller.Cloud.Project().Lexi().query().$promise
                        .then(projects => {
                            atInternet.trackEvent({
                                event: `CloudProject-${projects.length}`,
                                page: "cloud::iaas::pci-project::compute::infrastructure::diagram"
                            });
                        });
                }
            }/*,
            CloudProjectComputeInfrastructureListCtrl: {
                initInfra (atInternet, controller) {
                    controller.Cloud.Project().Lexi().query().$promise
                        .then(projects => {
                            atInternet.trackEvent({
                                event: `CloudProject-${projects.length}`,
                                page: "cloud::iaas::pci-project::compute::infrastructure::list"
                            });
                        });
                }
            }*/
        });
    });
