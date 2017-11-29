class CloudProjectComputeInfrastructureOpenstackTerminalService {
    constructor ($q, $stateParams, OvhApiCloudProjectOpenstackTerminal, OvhApiCloudProjectRegion, CloudMessage, ServiceHelper) {
        this.$q = $q;
        this.OvhApiCloudProjectOpenstackTerminal = OvhApiCloudProjectOpenstackTerminal;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.CloudMessage = CloudMessage;
        this.ServiceHelper = ServiceHelper;

        this.REGION_ALL = "All";
        this.region = this.REGION_ALL;
        this.ws = null;

    }

    getSession ({ serviceName, term }) {
        return this.OvhApiCloudProjectOpenstackTerminal.Lexi().post({ serviceName }).$promise
            .then(session => {
                if (!term) {
                    return session;
                }
                return this.initWebSocket(session, term);
            })
            .catch(this.ServiceHelper.errorHandler("openstack_terminal_session_error"));
    }

    getRegions (serviceName) {
        return this.OvhApiCloudProjectRegion.Lexi().query({ serviceName }).$promise
            .then(regions => _.flatten([this.REGION_ALL, regions]))
            .catch(this.ServiceHelper.errorHandler("openstack_terminal_regions_error"));
    }

    sendAction (action, region) {
        this.send(`openstack ${action}\n`, region);
    }

    initWebSocket (session, term) {
        const self = this;
        const defer = this.$q.defer();
        this.ws = new WebSocket(session.websocket);
        this.ws.onopen = () => {
            defer.resolve(session);
            self.send("\n");
        };

        this.ws.onmessage = event => {
            const data = event.data.slice(1);
            switch (event.data[0]) {
                case "0":
                    term.io.writeUTF8(atob(data));
                    break;
                case "1":
                    // pong
                    break;
                case "2":
                    // Object.keys(JSON.parse(data)).forEach(key => {
                    //     console.log(`Term preferences, setting ${key} = ${preferences[key]}`);
                    // });
                    break;
                case "3":
                    // var autoReconnect = JSON.parse(data);
                    // console.log(`Enabling term reconnect: ${autoReconnect} seconds`);
                    break;
                default :break;
            }
        };

        this.ws.onclose = function () {
            defer.reject();
            self.ServiceHelper.errorHandler("openstack_terminal_socket_closed");
        };
        return defer.promise;
    }

    send (data, region) {
        if (!this.ws) {
            return;
        }
        if (region && region !== this.REGION_ALL) {
            this.ws.send(`0OS_REGION_NAME=${region} `);
        }
        this.ws.send(`0${data}`);
    }

    setConfig (config) {
        if (this.ws) {
            this.ws.send(`2${JSON.stringify(config)}`);
        }
    }

}


angular.module("managerApp").service("CloudProjectComputeInfrastructureOpenstackTerminalService", CloudProjectComputeInfrastructureOpenstackTerminalService);
