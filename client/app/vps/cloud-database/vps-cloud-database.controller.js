class VpsCloudDatabaseCtrl {
    constructor ($q, OvhApiHostingPrivateDatabase) {
        this.$q = $q;
        this.OvhApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
    }

    $onInit () {
        this.cloudDatabases = [];
        this.refresh();
    }

    refresh () {
        this.OvhApiPrivateDb.query().$promise
            .then(serviceNames => this.$q.all(
                _.map(
                    serviceNames,
                    serviceName => this.OvhApiPrivateDb.get({ serviceName }).$promise
                )
            ))
            .then(databases => _.filter(databases, { offer: "public" }))
            .then(databases => {
                this.cloudDatabases = _.map(
                    databases,
                    database => ({
                        name: database.displayName || database.serviceName,
                        version: database.version,
                        vpsAuthorized: false,
                        status: database.state
                    }));
            });
    }
}

angular.module("managerApp").controller("VpsCloudDatabaseCtrl", VpsCloudDatabaseCtrl);
