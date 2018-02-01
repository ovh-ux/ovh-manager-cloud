class CloudMainController {
    constructor ($document, $interval, $rootScope, $translate, OvhApiProducts) {
        this.$document = $document;
        this.$interval = $interval;
        this.$rootScope = $rootScope;
        this.$translate = $translate;
        this.OvhApiProducts = OvhApiProducts;
    }

    $onInit () {
        this.expiringProject = null;

        this.init();

        this.$rootScope.$on("CloudMainController:refresh", () => {
            this.init();
        });
    }

    init () {
        this.OvhApiProducts.Aapi().get({
            universe: "cloud",
            product: "PROJECT"
        }).$promise
            .then(results => results.results[0].services)
            .then(products => products.filter(product => product.expiration))
            .then(products => {
                if (products && products.length) {
                    this.expiringProject = products[0];
                    this.expiringProjectInterval = this.$interval(() => {
                        this.updateRemainingTime();
                    }, 1000);
                }
            });
    }

    updateRemainingTime () {
        const expirationMoment = moment(this.expiringProject.expiration);
        if (expirationMoment.isBefore(moment().utc()) && angular.isDefined(this.expiringProjectInterval)) {
            this.$interval.cancel(this.expiringProjectInterval);
        }
        this.remainingTime = this.getRemainingTime(this.expiringProject.expiration);
    }

    getRemainingTime (expiration) {
        const expirationMoment = moment(expiration);
        const ms = Math.max(0, moment(expirationMoment).diff(moment().utc()));
        const duration = moment.duration(ms);
        this.expirationDays = duration.days();
        this.expirationHours = duration.hours();
        this.expirationMinutes = duration.minutes();
    }

    scrollTo (id) {
        // Set focus to target
        this.$document.find(`#${id}`)[0].focus();
    };
}

angular.module("managerApp").controller("CloudMainController", CloudMainController);
