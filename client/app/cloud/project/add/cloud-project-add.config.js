angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {

        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectAddCtrl: {
                createProject (atInternet, controller) {
                    if (controller.data.isFirstProjectCreation) {
                        atInternet.trackClick({
                            name: "AccountActivation",
                            type: "action"
                        });
                    }
                }
            }
        });
    });
