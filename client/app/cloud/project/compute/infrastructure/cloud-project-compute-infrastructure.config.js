angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectComputeInfrastructureCtrl: {
                initInfra (atInternet, controller) {
                    controller.Cloud.Project().Lexi().query().$promise
                        .then(projects => {
                            atInternet.trackEvent({
                                event: `CloudProject-${projects.length}`,
                                page: "cloud::cloud-project::compute::infrastructure"
                            });
                        });
                }
            }
        });
    });
