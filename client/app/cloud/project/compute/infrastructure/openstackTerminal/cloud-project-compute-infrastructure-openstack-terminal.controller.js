class CloudProjectComputeInfrastructureOpenstackTerminalCtrl {
    constructor ($q, $stateParams, $translate, OvhApiCloudProjectOpenstackTerminal, CloudProjectComputeInfrastructureOpenstackTerminalService, OvhApiCloudProjectRegion, CloudMessage, ControllerHelper, hterm) {
        this.$q = $q;
        this.$translate = $translate;
        this.OvhApiCloudProjectOpenstackTerminal = OvhApiCloudProjectOpenstackTerminal;
        this.Service = CloudProjectComputeInfrastructureOpenstackTerminalService;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;

        this.serviceName = $stateParams.projectId;
        this.term = new hterm.Terminal();
        this.messages = [];
        this.region = this.Service.REGION_ALL;
        this.minimized = sessionStorage.getItem("CloudProjectComputeInfrastructureOpenstackTerminalCtrl.minimized") !== "false";
        this.maximized = sessionStorage.getItem("CloudProjectComputeInfrastructureOpenstackTerminalCtrl.maximized") === "true";
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

        this.CloudMessage.unSubscribe("iaas.pci-project.compute.infrastructure");
        this.messageHandler = this.CloudMessage.subscribe("iaas.pci-project.compute.infrastructure", { onMessage: () => this.refreshMessages() });
        this.session.load();
        this.regions.load();
    }

    refreshMessages () {
        this.messages = this.messageHandler.getMessages();
    }

    clickBar () {
        if (this.minimized) {
            this.minimized = false;
            this.savePrefs();
        }
    }

    minimize () {
        this.minimized = !this.minimized;
        this.maximized = false;
        this.savePrefs();
    }

    maximize () {
        this.maximized = !this.maximized;
        this.minimized = false;
        this.savePrefs();
    }

    savePrefs () {
        sessionStorage.setItem("CloudProjectComputeInfrastructureOpenstackTerminalCtrl.minimized", this.minimized);
        sessionStorage.setItem("CloudProjectComputeInfrastructureOpenstackTerminalCtrl.maximized", this.maximized);
    }
}


angular.module("managerApp").controller("CloudProjectComputeInfrastructureOpenstackTerminalCtrl", CloudProjectComputeInfrastructureOpenstackTerminalCtrl);
