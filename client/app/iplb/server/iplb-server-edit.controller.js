class IpLoadBalancerServerEditCtrl {
    constructor ($q, $state, $stateParams, CloudMessage, ControllerHelper,
                 IpLoadBalancerConstant, IpLoadBalancerServerService) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.IpLoadBalancerServerService = IpLoadBalancerServerService;

        this.initLoaders();
    }

    initLoaders () {
        this.farmTypeLoader = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerServerService.getFarmType(
                    this.$stateParams.serviceName,
                    this.$stateParams.farmId
                )
                .then(type => {
                    this.farmType = type;
                })
                .catch(err => {
                    if (err === "NOTFOUND") {
                        return this.$state.go("network.iplb.detail.server-farm");
                    }
                    return this.ServiceHelper.errorHandler("iplb_server_request_error");
                })

        });

        this.apiServer = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerServerService.getServer(
                    this.$stateParams.serviceName,
                    this.$stateParams.farmId,
                    this.$stateParams.serverId
                ).then(server => {
                    this.server = angular.copy(server);
                })
        });
    }

    $onInit () {
        this.server = {
            status: "active"
        };

        this.farmTypeLoader.load();

        if (this.$stateParams.serverId) {
            this.edition = true;
            this.apiServer.load();
        }
    }

    getCleanServer () {
        if (this.farmType === "udp") {
            return _.omit(this.server, [
                "ssl",
                "cookie",
                "chain",
                "weight",
                "backup",
                "probe"
            ]);
        }
        return this.server;
    }

    create () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = true;
        this.CloudMessage.flushMessages();
        return this.IpLoadBalancerServerService.create(
            this.farmType,
            this.$stateParams.serviceName,
            this.$stateParams.farmId,
            this.getCleanServer()
        )
            .then(() => {
                this.$state.go("network.iplb.detail.server-farm");
            })

            .finally(() => {
                this.saving = false;
            });
    }

    update () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = true;
        this.CloudMessage.flushMessages();
        return this.IpLoadBalancerServerService.update(
            this.farmType,
            this.$stateParams.serviceName,
            this.$stateParams.farmId,
            this.server.serverId,
            this.getCleanServer()
        )
            .then(() => {
                this.$state.go("network.iplb.detail.server-farm");
            })
            .finally(() => {
                this.saving = false;
            });
    }
}

angular.module("managerApp").controller("IpLoadBalancerServerEditCtrl", IpLoadBalancerServerEditCtrl);
