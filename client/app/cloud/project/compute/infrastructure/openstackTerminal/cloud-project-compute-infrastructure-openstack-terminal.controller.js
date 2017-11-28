class CloudProjectComputeInfrastructureOpenstackTerminalCtrl {
    constructor ($q, $stateParams, $translate, OvhApiCloudProjectOpenstackTerminal, OvhApiCloudProjectRegion, CloudMessage) {
        this.$q = $q;
        this.$translate = $translate;
        this.OvhApiCloudProjectOpenstackTerminal = OvhApiCloudProjectOpenstackTerminal;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.CloudMessage = CloudMessage;

        this.serviceName = $stateParams.projectId;
        this.ws = null;
        this.term = {};
        this.regions = [];
        this.loaders = {
            websocket: true,
            regions: true
        };
        this.actions = {
            help: "help",
            catalog: "catalog list",
            server: "server list",
            image: "image list",
            flavor: "flavor list",
            volume: "volume list",
            network: "network list",
            subnet: "subnet list"
        };
        this.REGION_ALL = "All";
        this.region = this.REGION_ALL;
        this.init();
    }

    init () {
        this.OvhApiCloudProjectOpenstackTerminal.Lexi().post({ serviceName: this.serviceName }).$promise
            .then(openstackTerminal => this.initWebSocket(openstackTerminal.websocket))
            .catch(err => this.displayError(err))
            .finally(() => (this.loaders.websocket = false));
        this.OvhApiCloudProjectRegion.Lexi().query({ serviceName: this.serviceName }).$promise
            .then(regions => { this.regions = _.flatten([this.REGION_ALL, regions]); })
            .catch(err => this.displayError(err))
            .finally(() => (this.loaders.regions = false));
        this.loaders.regions = false;
    }

    displayError (err) {
        this.CloudMessage.error([this.$translate.instant("cpc_openstack_terminal_error"), err.data && err.data.message || ""].join(": "));
    }

    sendAction (action) {
        if (this.region !== this.REGION_ALL) {
            this.setRegion(this.region);
        }
        this.send(`openstack ${action}\n`);
    }

    initWebSocket (url) {
        const self = this;
        const promise = this.$q.defer();
        this.ws = new WebSocket(url);
        this.ws.onopen = function () {
            promise.resolve();
        };

        this.ws.onmessage = function (event) {
            const data = event.data.slice(1);
            switch (event.data[0]) {
                case "0":
                    self.term.io.writeUTF8(window.atob(data));
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
            promise.reject();
            self.closed = true;
        };
    }

    send (data) {
        if (this.ws) {
            this.ws.send(`0${data}`);
        }
    }

    setConfig (config) {
        if (this.ws) {
            this.ws.send(`2${JSON.stringify(config)}`);
        }
    }

    setRegion (region) {
        this.send(`OS_REGION_NAME=${region} `);
    }

    minimize () {
        this.minimized = !this.minimized;
        this.maximized = false;
    }

    maximize () {
        this.maximized = !this.maximized;
        this.minimized = false;
    }
}


angular.module("managerApp").controller("CloudProjectComputeInfrastructureOpenstackTerminalCtrl", CloudProjectComputeInfrastructureOpenstackTerminalCtrl);
