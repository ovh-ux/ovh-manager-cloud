class CloudProjectComputeInfrastructureOpenstackClientService {
    constructor ($q, $stateParams, $interval, OvhApiCloudProjectOpenstackClient, OvhApiCloudProjectRegion, ServiceHelper) {
        this.$q = $q;
        this.$interval = $interval;
        this.OvhApiCloudProjectOpenstackClient = OvhApiCloudProjectOpenstackClient;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.ServiceHelper = ServiceHelper;

        this.ws = null;
    }

    setSession (session, term) {
        this.session = session;
        this.updateExpiresAt();
        if (!term) {
            return session;
        }
        return this.initWebSocket(session, term);
    }


    getSession ({ serviceName, term }) {
        return this.OvhApiCloudProjectOpenstackClient.v6().post({ serviceName }, {}).$promise
            .then(session => this.setSession(session, term))
            .catch(this.ServiceHelper.errorHandler("cpci_openstack_client_session_error", "iaas.pci-project.compute.openstack-console"));
    }

    getRegions (serviceName) {
        return this.OvhApiCloudProjectRegion.v6().query({ serviceName }).$promise
            .catch(this.ServiceHelper.errorHandler("cpci_openstack_client_regions_error", "iaas.pci-project.compute.openstack-console"));
    }

    sendAction (action) {
        this.clear();
        this.send(`${action}\n`);
    }

    updateExpiresAt () {
        this.expiresAt = moment(this.session.expires).fromNow(true);
    }

    ping () {
        this.updateExpiresAt();
        this.ws.send("1");
    }

    initWebSocket (session, term) {
        const defer = this.$q.defer();
        let pingTimer;
        this.ws = new WebSocket(session.websocket);
        this.ws.onopen = () => {
            this.retry = false;
            this.ws.opened = true;
            pingTimer = this.$interval(() => this.ping(), 15 * 1000);
            defer.resolve(session);
        };

        this.ws.onmessage = event => {
            const data = event.data.slice(1);
            switch (event.data[0]) {
                case "0":
                    term.io.writeUTF8(atob(data));
                    break;
                default :break;
            }
        };

        this.ws.onclose = () => {
            if (pingTimer) {
                this.$interval.cancel(pingTimer);
            }
            if (this.success) {
                return;
            }
            if (!this.retry && moment(this.session.expires).isAfter()) {
                this.retry = true;
                this.initWebSocket(session, term);
                return;
            }
            this.ServiceHelper.errorHandler("cpci_openstack_client_session_closed", "iaas.pci-project.compute.openstack-console")({ data: "Expired Session" });
            defer.reject();
        };

        this.ws.onerror = err => {
            this.ServiceHelper.errorHandler("cpci_openstack_client_session_error", "iaas.pci-project.compute.openstack-console")(err);
            defer.reject(err);
        };

        return defer.promise;
    }

    close () {
        this.success = true;
        if (this.ws) {
            this.ws.close();
        }
    }

    send (data) {
        if (!this.wsReady()) {
            return;
        }
        this.ws.send(`0${data}`);
    }

    clear () {
        // to clear the line before sending data
        this.ws.send("0\x15\x0b");
    }

    setRegion (region) {
        if (!this.wsReady()) {
            return;
        }
        this.clear();
        this.send(`export OS_REGION_NAME=${region}\n`);
    }

    setConfig (config) {
        if (!this.wsReady()) {
            return;
        }
        this.ws.send(`2${JSON.stringify(config)}`);
    }

    wsReady () {
        return this.ws && this.ws.opened;
    }

}


angular.module("managerApp").service("CloudProjectComputeInfrastructureOpenstackClientService", CloudProjectComputeInfrastructureOpenstackClientService);
