class IpLoadBalancerServerFarmProbeEditCtrl {
    constructor ($uibModalInstance, IpLoadBalancerConstant, edition, farm) {
        this.$uibModalInstance = $uibModalInstance;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.edition = edition;
        this.farm = farm;
        this.farmProbe = this.farm.probe ? angular.copy(this.farm.probe) : {
            match: "default"
        };

        this.methods = IpLoadBalancerConstant.probeMethods;
        this.matches = IpLoadBalancerConstant.probeMatches;

        if (!this.edition) {
            this.farmProbe.port = this.farm.port;
            this.farmProbe.interval = 30;

            switch (this.farmProbe.type) {
                case "http":
                    this.farmProbe.method = "GET";
                    this.farmProbe.url = "/";
                    break;
                default: break;
            }

            if (this.farmProbe.type === "oco") {
                delete this.farmProbe.port;
            }
        }
    }

    cleanProbe () {
        if (this.farmProbe.match === "default") {
            this.farmProbe.pattern = null;
        }
        if (!this.farmProbe.negate) {
            this.farmProbe.negate = null;
        }
    }

    close () {
        this.cleanProbe();
        this.$uibModalInstance.close(this.farmProbe);
    }

    dismiss () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp")
    .controller("IpLoadBalancerServerFarmProbeEditCtrl", IpLoadBalancerServerFarmProbeEditCtrl);
