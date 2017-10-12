angular.module("managerApp")
    .directive("cuiTileDefinitionDescriptionRegion", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionDescriptionRegionCtrl {
            constructor (RegionService) {
                this.RegionService = RegionService;
            }

            $onInit () {
                this.regionsGroup = [];
                if (this.regions) {
                    this.detailedRegions = !_.isArray(this.regions) ?
                        [this.RegionService.getRegion(this.regions)] :
                        _.map(this.regions, region => this.RegionService.getRegion(region));
                }

                this.regionsGroup = _.groupBy(this.detailedRegions, "country");
            }

            hasMultipleRegions () {
                return this.detailedRegions.length > 1;
            }
        },
        scope: true,
        template: `
            <dd class="cui-tile__description cui-tile-definition-description-region">
                <div data-ng-if="!$ctrl.hasMultipleRegions()">
                    <i class="flag-icon {{ $ctrl.detailedRegions[0].icon }} flag flag__icon-sm cui-tile-definition-description-region__flag cui-tile-definition-description-region__flag-last"></i>
                    <span>
                        <span data-ng-bind=":: $ctrl.detailedRegions[0].microRegion.text"></span> -
                        <small data-ng-bind=":: $ctrl.detailedRegions[0].country"></small>
                    </span>
                </div>
                <div data-ng-if="$ctrl.hasMultipleRegions()" data-ng-repeat="(key, regions) in $ctrl.regionsGroup track by $index">
                    <i class="flag-icon {{ regions[0].icon }} flag flag__icon-sm cui-tile-definition-description-region__flag"
                        data-ng-class="{ 'cui-tile-definition-description-region__flag_last': $last }"></i>
                    <span data-ng-repeat="region in regions track by $index">
                        <span data-ng-bind=":: region.macroRegion.code + (!$last ? ', ' : '')"></span>
                    </span>
                </div>
            </dd>`,
        bindToController: {
            regions: "<"
        }
    }));
