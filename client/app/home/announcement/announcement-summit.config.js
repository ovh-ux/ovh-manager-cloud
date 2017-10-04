angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            AnnouncementSummitCtrl: {
                confirm (atInternet) {
                    atInternet.trackClick({
                        name: "Summit-2017-announcement-register",
                        type: "action"
                    });
                }
            }
        });
    });
