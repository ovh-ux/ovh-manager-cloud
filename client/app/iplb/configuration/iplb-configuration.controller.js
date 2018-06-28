class IpLoadBalancerConfigurationCtrl {
    constructor ($q, $scope, $stateParams, CloudMessage, CloudPoll, ControllerHelper, IpLoadBalancerConfigurationService) {
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConfigurationService = IpLoadBalancerConfigurationService;

        this.initLoaders();

        this.$scope.$on("$destroy", () => this.stopTaskPolling());
    }

    initLoaders () {
        this.zones = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerConfigurationService.getAllZonesChanges(this.$stateParams.serviceName)
        });
    }

    $onInit () {
        this.zones.load()
            .then(() => {
                this.startPolling();
            });

        this.selectedZones = [];
    }

    onSelectionChange (zone) {
        const index = _.indexOf(this.selectedZones, zone);
        if (index === -1) {
            // zone selected
            this.selectedZones.push(zone);
        } else {
            // zone unselected
            this.selectedZones.splice(index, 1);
        }
    }

    applyChanges (zone) {
        let promise = this.$q.resolve([]);
        if (zone) {
            promise = this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, zone);
        } else if (this.selectedZones.length === this.zones.length) { // All selected, just call the API with no zone.
            promise = this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, null);
        } else if (this.selectedZones.length) {
            promise = this.IpLoadBalancerConfigurationService.batchRefresh(this.$stateParams.serviceName, _.map(this.selectedZones, "id"));
        }

        promise.then(() => {
            this.startPolling();
            if (this.poller) {
                this.poller.$promise.then(() => {
                    // check if at least one change remains
                    if (_.chain(this.zones.data).map("changes").sum().value() > 0) {
                        this.CloudMessage.flushChildMessage();
                    } else {
                        this.CloudMessage.flushMessages();
                    }
                });
            }
        });

        return promise;
    }

    startPolling () {
        this.stopTaskPolling();

        this.poller = this.CloudPoll.pollArray({
            items: this.zones.data,
            pollFunction: zone => this.IpLoadBalancerConfigurationService.getZoneChanges(this.$stateParams.serviceName, zone.id),
            stopCondition: zone => !zone.task || (zone.task && _.includes(["done", "error"], zone.task.status) && (zone.changes === 0 || zone.task.progress === 100))
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }
}

angular.module("managerApp").controller("IpLoadBalancerConfigurationCtrl", IpLoadBalancerConfigurationCtrl);
