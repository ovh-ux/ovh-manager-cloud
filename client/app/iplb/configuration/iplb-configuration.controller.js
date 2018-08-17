class IpLoadBalancerConfigurationCtrl {
    constructor ($q, $scope, $stateParams, CloudMessage, CloudPoll, ControllerHelper, IpLoadBalancerConfigurationService, ServiceHelper) {
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConfigurationService = IpLoadBalancerConfigurationService;
        this.ServiceHelper = ServiceHelper;

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

    onSelectionChange (selection) {
        this.selectedZones = selection;
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

    statusTemplate () {
        return `
            <span data-ng-if="$row.changes === 0" class="oui-status oui-status_success" data-translate="iplb_configuration_changes_0"></span>
            <span data-ng-if="$row.changes === 1" class="oui-status oui-status_warning" data-translate="iplb_configuration_changes_1"></span>
            <span data-ng-if="$row.changes > 1" class="oui-status oui-status_warning" data-translate="iplb_configuration_changes_count" data-translate-values="{ count: $row.changes }"></span>
        `;
    }

    actionTemplate () {
        return `
            <oui-action-menu data-align="end" data-compact>
                <oui-action-menu-item
                    data-text="{{'iplb_configuration_action_apply' | translate}}"
                    data-on-click="ctrl.applyChanges($row.id)">
                </oui-action-menu-item>
            </oui-action-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerConfigurationCtrl", IpLoadBalancerConfigurationCtrl);
