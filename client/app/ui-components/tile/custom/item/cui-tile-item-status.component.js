angular.module("managerApp")
    .directive("cuiTileItemStatus", () => ({
        replace: true,
        restrict: "E",
        controller: class CuiTileItemStatusCtrl {
            constructor ($element) {
                this.$element = $element;
            }

            $postLink () {
                this.$element.addClass("cui-tile__item");
            }
        },
        scope: true,
        controllerAs: "$ctrl",
        transclude: true,
        template: `
            <div class="cui-tile-item-status" data-ng-class="{ 'cui-dropdown-menu-container': $ctrl.actions }">
                <div class="d-flex">
                    <div class="cui-tile__item-main" data-ng-if="$ctrl.term">
                        <cui-tile-definitions data-ng-if="$ctrl.term">
                            <cui-tile-term-status data-term="$ctrl.term"></cui-tile-term-status>
                            <cui-tile-description-status data-type="{{ $ctrl.type }}" 
                                data-description="$ctrl.description"></cui-tile-description-status>
                        </cui-tile-definitions>
                    </div>
                    <div class="cui-tile__item-main" data-ng-if="!$ctrl.term && !$ctrl.description" data-ng-transclude></div>
                    <cui-tile-action-menu data-ng-if="$ctrl.actions" data-actions="$ctrl.actions"></cui-tile-action-menu>
                </div> 
            </div>`,
        bindToController: {
            term: "<",
            description: "<",
            actions: "<",
            type: "@"
        }
    }))
    .directive("cuiTileTermStatus", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionTermCtrl {},
        scope: true,
        template: `
            <dt class="cui-tile-item-status__term" data-ng-bind="$ctrl.term"></dt>`,
        bindToController: {
            term: "<"
        }
    }))
    .directive("cuiTileDescriptionStatus", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionDescriptionCtrl {},
        scope: true,
        transclude: true,
        template: `
            <dd class="cui-tile-item-status__description text-truncate d-flex">
                <cui-status-icon class="cui-tile-item-status__icon" data-type="{{ $ctrl.type }}"></cui-status-icon>
                <div class="cui-tile-item-status__detail text-truncate">
                    <span data-ng-if="$ctrl.description !== null && $ctrl.description !== ''" data-ng-bind="$ctrl.description"></span>
                    <span data-ng-if="$ctrl.description === null || $ctrl.description === ''" data-ng-bind="'-'"></span>
                    <ng-transclude></ng-transclude>
                </div>
            </dd>`,
        bindToController: {
            type: "@",
            description: "<"
        }
    }));
