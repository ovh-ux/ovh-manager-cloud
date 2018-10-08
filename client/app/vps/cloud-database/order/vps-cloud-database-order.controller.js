class VpsCloudDatabaseOrderCtrl {
    constructor (
        $q,
        $translate,
        CloudMessage,
        OvhApiHostingPrivateDatabase,
        OvhApiOrderPrivateDatabase,
        OvhApiMe
    ) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
        this.ApiOrderDb = OvhApiOrderPrivateDatabase.v6();
        this.ApiMe = OvhApiMe.v6();
    }

    $onInit () {
        this.loading = {
            durations: false,
            redirection: false,
            purchaseOrder: false
        };

        this.versions = [];
        this.ramAmounts = [];
        this.datacenters = [];
        this.durations = null;

        this.currentOrder = {
            version: null,
            ram: null,
            datacenter: null,
            duration: null,
            contractsAccepted: false
        };

        this.loadSelectValues();
        this.ApiMe.get().$promise.then(user => {
            this.user = user;
        });
    }

    loadSelectValues () {
        return this.ApiPrivateDb.availableOrderCapacities({ offer: "public" }).$promise
            .then(capacity => {
                this.versions = _.map(_.sortBy(capacity.version), version => ({
                    value: version,
                    name: this.$translate.instant(`common_database_version_${version.replace(".", "")}`)
                }));
                this.ramAmounts = _.map(capacity.ram, ram => ({
                    value: ram,
                    name: `${ram} ${this.$translate.instant("unit_size_MB")}`
                }));
                this.datacenters = _.map(capacity.datacenter, datacenter => ({
                    value: datacenter,
                    name: this.$translate.instant(`common_datacenter_${datacenter}`)
                }));
            });
    }

    showOrRefreshDurations () {
        this.currentOrder.duration = null;

        if (!this.currentOrder.version ||
            !this.currentOrder.ram ||
            !this.currentOrder.datacenter) {
            return this.$q.when();
        }

        const version = this.currentOrder.version.value;
        const ram = this.currentOrder.ram.value;
        const datacenter = this.currentOrder.datacenter.value;

        this.loading.durations = true;
        return this.ApiOrderDb.getNew({ version, ram, datacenter }).$promise
            .then(durations => {
                this.durations = _.map(durations, duration => ({ value: duration, prices: null }));
                // we run this in parallel, so no return
                this.getPricesForEachDuration(this.durations, version, ram, datacenter);
            })
            .catch(error => this.CloudMessage.error([
                this.$translate.instant("vps_tab_cloud_database_order_fetch_duration_failed"),
                _(error).get("data.message", error)
            ].join(" ")))
            .finally(() => {
                this.loading.durations = false;
            });
    }

    getPricesForEachDuration (durations, version, ram, datacenter) {
        return this.$q.all(_.map(
            durations,
            duration => this.getPrices(duration, version, ram, datacenter)
        )).catch(error => this.CloudMessage.error([
            this.$translate.instant("vps_tab_cloud_database_order_fetch_prices_failed"),
            _(error).get("data.message", error)
        ].join(" ")));
    }

    getPrices (duration, version, ram, datacenter) {
        return this.ApiOrderDb.getNewDetails({ duration: duration.value, version, ram, datacenter }).$promise
            .then(({ prices }) => {
                duration.prices = prices;
            });
    }
}

angular.module("managerApp").controller("VpsCloudDatabaseOrderCtrl", VpsCloudDatabaseOrderCtrl);
