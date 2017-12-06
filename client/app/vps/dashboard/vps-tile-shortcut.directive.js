angular.module("managerApp")
    .directive("vpsTileShortcutItem", () => ({
        template: `
            <li class="cui-tile__item cui-tile__item_button">
                <button class="oui-button oui-button_link oui-button_icon-right oui-button_full-width cui-tile__button"
                    type="button"
                    data-ng-click="$ctrl.action()">
                    <span data-ng-bind="$ctrl.text"></span>
                    <i class="oui-icon oui-icon-chevron-right" aria-hidden="true"></i>
                </button>
            </li>
        `,
        controller: class {},
        controllerAs: "$ctrl",
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true,
        bindToController: {
            action: "&",
            text: "<"
        }
    }));
