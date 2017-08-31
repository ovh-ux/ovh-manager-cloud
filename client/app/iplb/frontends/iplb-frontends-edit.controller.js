class IpLoadBalancerFrontendsEditCtrl {
    constructor ($q, $state, $stateParams, $translate, CloudMessage, ControllerHelper,
                 IpLoadBalancerConstant, IpLoadBalancerFailoverIpService,
                 IpLoadBalancerFrontendsService, IpLoadBalancerZoneService) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.IpLoadBalancerFailoverIpService = IpLoadBalancerFailoverIpService;
        this.IpLoadBalancerFrontendsService = IpLoadBalancerFrontendsService;
        this.IpLoadBalancerZoneService = IpLoadBalancerZoneService;

        this.initLoaders();
    }

    initLoaders () {
        this.zones = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerZoneService.getZonesSelectData()
        });
        this.farms = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerFrontendsService.getFarmsChoices(
                this.getFarmType(),
                this.$stateParams.serviceName
            )
        });
        this.certificates = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerFrontendsService.getCertificatesChoices(
                this.$stateParams.serviceName
            )
        });
        this.failoverIps = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerFailoverIpService.getFailoverIpsSelectData(
                this.$stateParams.serviceName
            )
        });
        this.apiFrontend = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerFrontendsService.getAllFrontendsTypes(
                this.$stateParams.serviceName
            )
                .then(frontends => {
                    const frontend = _.find(frontends, {
                        id: parseInt(this.$stateParams.frontendId, 10)
                    });
                    return this.IpLoadBalancerFrontendsService.getFrontend(
                        frontend.type,
                        this.$stateParams.serviceName,
                        this.$stateParams.frontendId
                    );
                }).then(frontend => this.parseFrontend(frontend))
        });
    }

    getFarmType () {
        switch (this.protocol) {
            case "http":
            case "https":
                return "http";
            case "tcp":
            case "tls":
                return "tcp";
            default:
                return this.protocol;
        }
    }

    getFarmName (farm) {
        const farmName = farm.displayName || farm.farmId;
        if (farm.farmId > 0) {
            const farmType = this.$translate.instant(`iplb_frontend_add_protocol_${farm.type}`);
            return `${farmName} (${farmType})`;
        }
        return farmName;
    }

    getCertificateName (certificate) {
        if (certificate.id <= 0) {
            return certificate.displayName;
        }
        return certificate.displayName ? `${certificate.displayName} (${certificate.id})` : certificate.id;
    }

    onProtocolChange () {
        this.farmType = this.getFarmType();
        switch (this.protocol) {
            case "http":
                this.type = "http";
                this.frontend.port = 80;
                this.frontend.ssl = false;
                break;
            case "https":
                this.type = "http";
                this.frontend.port = 443;
                this.frontend.ssl = true;
                break;
            case "tcp":
                this.type = "tcp";
                delete this.frontend.port;
                this.frontend.ssl = false;
                break;
            case "udp":
                this.type = "udp";
                delete this.frontend.port;
                this.frontend.ssl = false;
                break;
            case "tls":
                this.type = "tcp";
                delete this.frontend.port;
                this.frontend.ssl = true;
                break;
            default: break;
        }

        if (this.frontend.ssl) {
            this.certificates.load();
        }

        this.farms.load();
    }

    onFarmChange () {
        if (this.frontend.defaultFarm === -1) {
            this.$state.go("network.iplb.detail.server-farm.add");
        }
    }

    $onInit () {
        this.frontend = {
            zone: 0,
            dedicatedIpfo: 0,
            defaultSslId: 0,
            defaultFarmId: 0,
            port: 80,
            ssl: false
        };
        this.type = "http";
        this.protocol = "http";
        this.saving = false;
        this.protocols = this.IpLoadBalancerConstant.protocols;
        this.portLimit = this.IpLoadBalancerConstant.portLimit;

        this.farms.load();
        this.zones.load();
        this.failoverIps.load();

        if (this.$stateParams.frontendId) {
            this.edition = true;
            this.apiFrontend.load();
        }
    }

    validateSelection (value) {
        return value && value !== "0";
    }

    isProtocolDisabled (protocol) {
        if (!this.edition) {
            return false;
        }

        if (this.type === "http" && /http/.test(protocol)) {
            return false;
        } else if (this.protocol === protocol) {
            return false;
        }

        return true;
    }

    /**
     * Parse frontend object from API and send it to form.
     * @return parsed frontend object
     */
    parseFrontend (frontend) {
        this.type = frontend.protocol;
        switch (frontend.protocol) {
            case "http":
                this.protocol = frontend.ssl ? "https" : "http";
                break;
            case "tcp":
                this.protocol = frontend.ssl ? "tls" : "tcp";
                break;
            case "udp":
                this.protocol = "udp";
                break;
            default: break;
        }
        frontend.port = parseInt(frontend.port, 10);
        this.frontend = angular.copy(frontend);
        return frontend;
    }

    /**
     * Clean frontend from form and send it to API.
     * @return clean frontend object
     */
    getCleanFrontend () {
        const request = angular.copy(this.frontend);
        if (this.type === "udp") {
            delete request.ssl;
        }
        if (!request.ssl || !request.defaultSslId) {
            delete request.defaultSslId;
        }
        if (!request.defaultFarmId) {
            delete request.defaultFarmId;
        }
        delete request.protocol;
        return request;
    }

    sendForm () {
        if (this.$stateParams.frontendId) {
            this.updateFrontend();
        } else {
            this.addFrontend();
        }
    }

    createFrontend () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = true;
        this.CloudMessage.flushMessages();
        return this.IpLoadBalancerFrontendsService.createFrontend(this.type, this.$stateParams.serviceName, this.getCleanFrontend())
            .then(() => this.$state.go("network.iplb.detail.frontends"))
            .finally(() => {
                this.saving = false;
            });
    }

    updateFrontend () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = true;
        this.CloudMessage.flushMessages();
        return this.IpLoadBalancerFrontendsService.updateFrontend(this.type, this.$stateParams.serviceName, this.frontend.frontendId, this.getCleanFrontend())
            .then(() => this.$state.go("network.iplb.detail.frontends"))
            .finally(() => {
                this.saving = false;
            });
    }
}

angular.module("managerApp").controller("IpLoadBalancerFrontendsEditCtrl", IpLoadBalancerFrontendsEditCtrl);
