angular.module("managerApp")
    .directive("cuiTileItemStatus", () => ({
        replace: true,
        restrict: "E",
        controller: class CuiTileItemStatusCtrl {
        },
        scope: true,
        controllerAs: "$ctrl",
        template: `
            <div data-ng-class="{ 'cui-dropdown-menu-container': $ctrl.actions }" class="cui-tile__item cui-tile-item-status">
                <div class="cui-tile__definition cui-tile-item-status__definition">
                    <cui-status-icon data-type="{{ $ctrl.type }}"></cui-status-icon>
                    <dl class="cui-tile-item-status__description">
                        <cui-tile-definition-term data-term="$ctrl.term"></cui-tile-definition-term>
                        <cui-tile-definition-description data-description="$ctrl.description"></cui-tile-definition-description>
                    </dl>
                </div>
                <cui-tile-action-menu data-ng-if="$ctrl.actions" data-actions="$ctrl.actions"></cui-tile-action-menu>
            </div>`,
        bindToController: {
            term: "<",
            description: "<",
            actions: "<",
            type: "@"
        }
    }));
