class VpsDashboardCtrl {
    constructor ($filter, $stateParams, CloudMessage, VpsService) {
        this.$filter = $filter;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsService = VpsService;

        this.vps = {};

        this.loaders = {
            init: false
        }
    }

    $onInit () {
        this.loaders.init = true;
        this.loadData();
    }

    loadData () {
        this.VpsService.getSelected(true)
            .then(vps => {
                this.vps = vps;
                const expiration = moment.utc(vps.expiration);
                this.vps.expiration = moment([expiration.year(), expiration.month(), expiration.date()]).toDate();
                this.vps.ipv6Gateway = _.get($scope, "vps.ipv6Gateway"); //If an old value is present, we preserve it in case loadIPs is not called after.  
                this.vps.iconDistribution = vps.distribution ? "icon-" + vps.distribution.distribution : "";
                this.vps.iconLocationCountry = vps.location ? "icon-" + vps.location.country : "";

                if (vps.isExpired) {
                    this.CloudMessage.warning($translate.instant("common_service_expired", [vps.name]));
                } else if (vps.messages.length > 0) {
                    this.CloudMessage.error($translate.instant("vps_dashboard_loading_error"), vps);
                }
                this.loaders.init = false;
            });
    }

}

angular.module("managerApp").controller("VpsDashboardCtrl", VpsDashboardCtrl);