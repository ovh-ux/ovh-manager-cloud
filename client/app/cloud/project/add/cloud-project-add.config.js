"use strict";
/**
 *  Configuration for at-internet tracking
 **/
angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {

        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectAddCtrl: {
                createProject (atInternet, controller) {
                    if (controller.model.contractsAccepted && controller.data.agreements.length) {
                        atInternet.trackClick({
                            name: "AccountActivation"
                        });
                    }
                }
            }
        });
    });
