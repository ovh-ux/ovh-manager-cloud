class VpsCloudDatabaseOrderCtrl {
    constructor ($q, $translate, CloudMessage, OvhApiHostingPrivateDatabase, OvhApiOrderPrivateDatabase) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
        this.ApiOrderDb = OvhApiOrderPrivateDatabase.v6();
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

        this.loading.durations = true;
        return this.ApiOrderDb.getNew({
            version: this.currentOrder.version.value,
            ram: this.currentOrder.ram.value,
            datacenter: this.currentOrder.datacenter.value
        }).$promise
            .then(durations => {
                this.durations = _.map(durations, duration => ({
                    value: duration,
                    text: `${duration} months`
                }));
            })
            .catch(error => this.CloudMessage.error([
                this.$translate.instant("vps_tab_cloud_database_order_fetch_duration_failed"),
                _(error).get("data.message", "")
            ].join(" ")))
            .finally(() => {
                this.loading.durations = false;
            });
    }
}

angular.module("managerApp").controller("VpsCloudDatabaseOrderCtrl", VpsCloudDatabaseOrderCtrl);
