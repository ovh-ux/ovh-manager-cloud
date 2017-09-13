class NashaCtrl {
    constructor ($stateParams, $translate, $state, $q, OvhApiDedicatedNasha, ovhDocUrl, Toast, REDIRECT_URLS) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.$q = $q;
        this.$state = $state;
        this.OvhApiDedicatedNasha = OvhApiDedicatedNasha;
        this.Toast = Toast;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.ovhDocUrl = ovhDocUrl;

        this.loading = false;
        this.urlRenew = null;
        this.data = {};
        this.monitoring = {};
        this.guides = {};
    }

    $onInit () {
        this.data = {
            information: null,
            nasha: null,
            bars: []
        };

        this.monitoring = {
            enabled: false,
            loading: false
        };

        this.initGuides();
        this.loadNasha();
    }

    loadNasha () {
        this.loading = true;
        this.$q.all({
            nasha: this.OvhApiDedicatedNasha.Aapi().get({ serviceName: this.$stateParams.nashaId }).$promise,
            nashaInfo: this.OvhApiDedicatedNasha.Lexi().getServiceInfos({ serviceName: this.$stateParams.nashaId }).$promise
        })
            .then(data => {
                this.data.nasha = data.nasha;

                _.forEach(this.data.nasha.use, 
                    (part, key) => part.name = this.$translate.instant("nasha_storage_usage_type_" + key));

                this.monitoring.enabled = data.nasha.monitored;
                this.data.information = data.nashaInfo;
                this.urlRenew = this.REDIRECT_URLS.renew
                                    .replace("{serviceType}", "DEDICATED_NASHA")
                                    .replace("{serviceName}", this.data.nasha.serviceName);

                if (this.data.information.status === "expired") {
                    this.Toast.error(this.$translate.instant("nasha_expired"));
                }
            })
            .catch(() => this.Toast.error(this.$translate.instant("nasha_dashboard_loading_error")))
            .finally(() => this.loading = false);
    }

    initGuides () {
        this.guides.title = this.$translate.instant("nasha_guide_title");
        this.guides.footer = this.$translate.instant("nash_guide_footer");
        this.guides.list = [];
        this.guides.list.push({
            name : this.$translate.instant("nash_guide_name"),
            url : this.ovhDocUrl.getDocUrl("cloud/storage/nas")
        });
    }

    updateMonitoringState (state) {
        if (!this.monitoring.loading) {
            this.monitoring.enabled = state;
            this.monitoring.loading = true;
            this.OvhApiDedicatedNasha.Lexi().updateDetail({
                serviceName: this.data.nasha.serviceName,
                customName: this.data.nasha.customName,
                monitored: state
            }).$promise
                .then(() => {
                    this.monitoring.loading = false;
                    this.Toast.success(this.$translate.instant("nasha_dashboard_update_success_" + (state ? "enabled" : "disabled")));
                })
                .catch(error => {
                    this.monitoring.loading = false;
                    this.monitoring.enabled = !state;
                    this.Toast.error(this.$translate.instant("nasha_dashboard_update_error") + " " + error.message);
                });
        }
    }
}


angular.module("managerApp").controller("NashaCtrl", NashaCtrl);