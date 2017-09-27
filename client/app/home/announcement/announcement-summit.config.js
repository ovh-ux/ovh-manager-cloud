angular.module("managerApp")
    .config(atInternetControllerDecoratorsProvider => {
        atInternetControllerDecoratorsProvider.decorate({
            AnnouncementSummitCtrl: {
                confirm (atInternet) {
                    console.log("at-internet");
                    atInternet.trackEvent({
                        event: "Summit-2017-announcement-register",
                        page: "home"
                    });
                }
            }
        });
    });
