class CloudProjectComputeInfrastructureOpenstackClientCtrl {
    constructor ($interval, $q, $stateParams, $translate, OvhApiCloudProjectOpenstackClient, CloudProjectComputeInfrastructureOpenstackClientService, OvhApiCloudProjectRegion, CloudMessage, ControllerHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.OvhApiCloudProjectOpenstackClient = OvhApiCloudProjectOpenstackClient;
        this.Service = CloudProjectComputeInfrastructureOpenstackClientService;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;

        this.serviceName = $stateParams.projectId;
        this.term = new Terminal();
        this.messages = [];
        this.emptyOption = "emptyOption";
        this.region = this.emptyOption;
        this.minimized = sessionStorage.getItem("CloudProjectComputeInfrastructureOpenstackClientCtrl.minimized") !== "false";
        this.maximized = sessionStorage.getItem("CloudProjectComputeInfrastructureOpenstackClientCtrl.maximized") === "true";
        this.actions = {
            help: "openstack help | less",
            catalog: "openstack catalog list",
            server: "openstack server list",
            image: "openstack image list",
            flavor: "openstack flavor list",
            volume: "openstack volume list",
            network: "openstack network list",
            subnet: "openstack subnet list",
            "create server": "create-server.sh",
            "bigdata platform": "bigdata-platform-cli"
        };

        this.initLoaders();
    }

    initLoaders () {
        this.session = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.Service.getSession({ serviceName: this.serviceName, term: this.term })
        });
        this.regions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.Service.getRegions(this.serviceName)
        });
    }

    $onInit () {
        this.CloudMessage.unSubscribe("iaas.pci-project.compute.openstack-console");
        this.messageHandler = this.CloudMessage.subscribe("iaas.pci-project.compute.openstack-console", { onMessage: () => this.refreshMessages() });
        this.load();
    }

    refreshMessages () {
        this.messages = this.messageHandler.getMessages();
    }

    clickBar () {
        if (this.minimized) {
            this.minimized = false;
            this.load();
            this.savePrefs();
        }
    }

    minimize ($event) {
        this.minimized = !this.minimized;
        this.maximized = false;
        this.savePrefs();
        $event && $event.stopPropagation();
    }

    maximize ($event) {
        this.maximized = !this.maximized;
        this.minimized = false;
        this.load();
        this.savePrefs();
        $event && $event.stopPropagation();
    }

    $onDestroy () {
        this.Service.close();
    }

    load () {
        if (this.minimized) {
            return;
        }

        // No cache as it's POST
        if (!this.session.loading && (this.session.hasErrors || _.isEmpty(this.session.data))) {
            this.session.load();
        }
        this.regions.load();
    }
    savePrefs () {
        sessionStorage.setItem("CloudProjectComputeInfrastructureOpenstackClientCtrl.minimized", this.minimized);
        sessionStorage.setItem("CloudProjectComputeInfrastructureOpenstackClientCtrl.maximized", this.maximized);
    }
}


angular.module("managerApp").controller("CloudProjectComputeInfrastructureOpenstackClientCtrl", CloudProjectComputeInfrastructureOpenstackClientCtrl);
