class HomeCtrl {
    constructor ($window, $state, ProductsService, TranslateService, CloudUserPref, ControllerHelper) {
        this.$window = $window;
        this.$state = $state;
        this.ProductsService = ProductsService;
        this.TranslateService = TranslateService;
        this.CloudUserPref = CloudUserPref;
        this.ControllerHelper = ControllerHelper;

        this.summit = {
            link: {
                en: "https://summit.ovh.com/en/#xtor=CS4-32-[cloud-banner]",
                fr: "https://summit.ovh.com/fr/#xtor=CS4-32-[cloud-banner]"
            }
        };
    }

    redirectToPage () {
        //While we don't have a real homepage
        this.ProductsService.getCloudProjects()
            .then(projects => {
                if (projects && projects.length) {
                    return this.$state.go("iaas.pci-project.compute.infrastructure", {
                        projectId: projects[0].serviceName
                    });
                }
                return this.$state.go("iaas.pci-project-new");
            })
            .catch(() => {
                return this.$state.go("iaas.pci-project-new");
            });
    }

    showAnnouncement () {
        const locale = this.TranslateService.getGeneralLanguage();
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/home/announcement/announcement-summit.html",
                controller: "AnnouncementSummitCtrl",
                controllerAs: "AnnouncementSummitCtrl",
                resolve: {
                    locale: () => locale
                }
            },
            successHandler: () => {
                this.$window.open(this.summit.link[locale], "_blank");
                this.redirectToPage();
            },
            errorHandler: stop => {
                if (stop) {
                    this.CloudUserPref.set("ANNOUNCEMENT_STOP_SUMMIT2017", {
                        stop: true
                    })
                        .then(() => {
                            this.redirectToPage();
                        });
                } else {
                    this.redirectToPage();
                }
            }
        });
    }

    $onInit () {
        const summitEnds = moment("2017-10-18");
        const today = moment();
        if (summitEnds > today) {
            this.CloudUserPref.get("ANNOUNCEMENT_STOP_SUMMIT2017")
                .then(stopShow => {
                    if (_.isEmpty(stopShow) || stopShow.stop === false) {
                        this.showAnnouncement();
                    } else {
                        this.redirectToPage();
                    }
                });
        } else {
            this.redirectToPage();
        }

    }
}

angular.module("managerApp").controller("HomeCtrl", HomeCtrl);
