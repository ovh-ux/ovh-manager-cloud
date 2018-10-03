class VpsCloudDatabaseCtrl {
    constructor ($q, $stateParams, $translate, CloudMessage, OvhApiHostingPrivateDatabase, VpsService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
        this.ApiWhitelist = OvhApiHostingPrivateDatabase.Whitelist().v6();
        this.VpsService = VpsService;
    }

    $onInit () {
        this.serviceName = this.$stateParams.serviceName;

        this.statusFilterOptions = {
            values: {
                detached: this.$translate.instant("common_database_status_detached"),
                restartPending: this.$translate.instant("common_database_status_restartPending"),
                startPending: this.$translate.instant("common_database_status_startPending"),
                started: this.$translate.instant("common_database_status_started"),
                stopPending: this.$translate.instant("common_database_status_stopPending"),
                stopped: this.$translate.instant("common_database_status_stopped")
            }
        };

        this.ips = [];
        this.cloudDatabases = [];
        this.loading = true;

        this.refresh();
    }

    refresh () {
        return this.loadIps()
            .then(response => {
                this.ips = response.results;
            })
            .then(() => this.loadDatabases())
            .then(databases => {
                this.cloudDatabases = databases;
                this.loading = false;
            });
    }

    loadIps () {
        return this.VpsService.getIps(this.serviceName);
    }

    loadDatabases () {
        return this.ApiPrivateDb.query().$promise
            .then(serviceNames => this.$q.all(
                _.map(
                    serviceNames,
                    serviceName => this.ApiPrivateDb.get({ serviceName }).$promise
                )
            ))
            .then(databases => _.filter(databases, { offer: "public" }))
            .then(databases => this.$q.all(
                _.map(
                    databases,
                    database => this.isVpsAuthorized(database.serviceName)
                        .then(vpsAuthorized => {
                            database.vpsAuthorized = vpsAuthorized;
                            return database;
                        })
                )))
            .then(databases => _.map(
                databases,
                database => ({
                    name: database.displayName || database.serviceName,
                    version: database.version,
                    vpsAuthorized: database.vpsAuthorized,
                    status: database.state
                })))
            .catch(error => {
                this.CloudMessage.error(error);
            });
    }

    isVpsAuthorized (serviceName) {
        return this.ApiWhitelist.get({ serviceName }).$promise
            .then(whitelist => _.filter(whitelist, ip => this.isVpsInIpRange(ip)))
            // we need to take only IPs allowing db access,
            // so we get more details about matching IPs
            .then(whitelist => this.$q.all(
                _.map(
                    whitelist,
                    ip => this.ApiWhitelist.getIp({ serviceName, ip }).$promise
                )))
            .then(ipObjects => _.any(ipObjects, { service: true }));
    }

    isVpsInIpRange (ip) {
        const ipv4 = ipaddr.parse(_.get(_.first(this.ips, { version: "v4" }), "ipAddress"));
        return ipv4.match(ipaddr.parseCIDR(ip));
    }
}

angular.module("managerApp").controller("VpsCloudDatabaseCtrl", VpsCloudDatabaseCtrl);
