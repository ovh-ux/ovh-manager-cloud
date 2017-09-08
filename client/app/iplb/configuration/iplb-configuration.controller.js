class IpLoadBalancerConfigurationCtrl {
    constructor ($stateParams, ControllerHelper, IpLoadBalancerConfigurationService) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConfigurationService = IpLoadBalancerConfigurationService;

        this.initLoaders();
    }

    initLoaders () {
        this.zones = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerConfigurationService.getAllZonesChanges(this.$stateParams.serviceName)
        });
    }

    $onInit () {
        this.zones.load();

        this.selectedZones = [];
    }

    onSelectionChange (selection) {
        this.selectedZones = selection;
    }

    apply (zone) {
        if (zone) {
            return this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, zone);
        }

        // All selected, just call the API with no zone.
        if (this.selectedZones.length === this.zones.length) {
            return this.IpLoadBalancerConfigurationService.refresh(this.$stateParams.serviceName, null);
        }

        if (this.selectedZones.length) {
            return this.IpLoadBalancerConfigurationService.batchRefresh(this.$stateParams.serviceName, _.map(this.selectedZones, "id"));
        }

        return null;
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
                                data-ng-click="ctrl.apply($row.id)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerConfigurationCtrl", IpLoadBalancerConfigurationCtrl);
