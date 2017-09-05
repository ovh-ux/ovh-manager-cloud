"use strict";
/**
 *  Configuration for at-internet tracking
 **/
angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectComputeInfrastructureCtrl: {
                initInfra (atInternet, controller) {
                    controller.Cloud.Project().Lexi().query().$promise
                        .then(projects => {
                            atInternet.trackEvent({
                                event: `CloudProject-${projects.length}`,
                                page: "cloud-project::cloud-project-compute::cloud-project-compute-infrastructure"
                            });
                        });
                }
            }
        });
    });
