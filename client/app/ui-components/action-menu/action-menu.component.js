(() => {
    angular.module("managerApp")
        .component("cuiActionMenu", {
            templateUrl: `
                <div class="oui-action-menu" data-ng-transclude></div>`,
            transclude: true
        })
        .component("cuiActionMenuItem", {
            templateUrl: `
                <div class="oui-action-menu__item oui-action-menu-item">
                    <div class="oui-action-menu-item__icon">
                        <i data-ng-show="$ctrl.iconClass" class="oui-icon {{$ctrl.iconClass}}"></i>
                    </div>
                    <button class="oui-button oui-button_link oui-action-menu-item__label"
                        type="button"
                        data-ng-bind="$ctrl.text"
                        data-ng-disabled="$ctrl.disabled"
                        data-ng-click="$ctrl.onClick()"></button>
                </div>`,
            transclude: true,
            bindings: {
                disabled: "<",
                iconClass: "<",
                text: "<",
                onClick: "&"
            }
        });
})();
