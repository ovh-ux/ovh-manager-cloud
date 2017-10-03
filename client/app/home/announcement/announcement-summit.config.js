angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            AnnouncementSummitCtrl: {
                confirm (atInternet) {
                    atInternet.trackClick({
                        event: "Summit-2017-announcement-register",
                        page: "cloud::home"
                    });
                }
            }
        });
    });
