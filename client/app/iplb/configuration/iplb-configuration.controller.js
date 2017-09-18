class IpLoadBalancerConfigurationCtrl {
    constructor ($q, $scope, $stateParams, CloudPoll, ControllerHelper, IpLoadBalancerConfigurationService) {
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
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

    onSelectionChange (selection) {
        this.selectedZones = selection;
    }

    applyChanges (zone) {
        let promise = this.$q.resolve([]);
        if (zone) {
            promise = this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, zone);
        }

        // All selected, just call the API with no zone.
        if (this.selectedZones.length === this.zones.length) {
            promise = this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, null);
        }

        if (this.selectedZones.length) {
            promise = this.IpLoadBalancerConfigurationService.batchRefresh(this.$stateParams.serviceName, _.map(this.selectedZones, "id"));
        }

        promise.then(tasks => {
            if (tasks.length) {
                this.startPolling();
            }
        });

        return promise;
    }

    startPolling () {
        this.stopTaskPolling();

        this.poller = this.CloudPoll.pollArray({
            items: this.zones.data,
            pollFunction: zone => this.IpLoadBalancerConfigurationService.getZoneChanges(this.$stateParams.serviceName, zone.id),
            stopCondition: zone => zone.task && _.includes(["done", "error"], zone.task.status) && zone.changes === 0
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    statusTemplate () {
        return `
            <span data-ng-if="$row.changes === 0" translate-attr="{ title: 'iplb_configuration_changes_0' }">
                <cui-status-icon data-type="success"></cui-status-icon>
            </span>
            <span data-ng-if="$row.changes === 1" translate-attr="{ title: 'iplb_configuration_changes_1' }">
                <cui-status-icon data-type="warning"></cui-status-icon>
            </span>
            <span data-ng-if="$row.changes > 1" translate-attr="{ title: 'iplb_configuration_changes_count' }"
                translate-values="{ count: $row.changes }">
                <cui-status-icon data-type="warning"></cui-status-icon>
            </span>
        `;
    }

    actionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'iplb_configuration_action_apply' | translate"
                                data-ng-click="ctrl.applyChanges($row.id)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerConfigurationCtrl", IpLoadBalancerConfigurationCtrl);
