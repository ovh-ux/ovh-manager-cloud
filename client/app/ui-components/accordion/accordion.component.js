angular.module("managerApp")
    .component("cuiAccordionList", {
        transclude: true,
        template: `
            <div class="cui-accordion-list" data-ng-transclude></div>
        `
    })
    .directive("cuiAccordion", () => ({
        transclude: true,
        template: `
            <div class="cui-accordion cui-accordion-list__item"
                data-ng-class="{ 'cui-accordion_open': $ctrl.expanded }">
                <div class="cui-accordion__header cui-dropdown-menu-container">
                    <div class="cui-accordion__header-text">
                        <h5 role="button" tabindex="0"
                            class="oui-header_5 cui-accordion__header-title"
                            data-ng-bind="$ctrl.title"
                            data-ng-click="$ctrl.toggle()"></h5>
                        <div class="cui-accordion__header-subtitle" data-ng-bind="$ctrl.text"></div>
                    </div>
                    <div class="cui-accordion__button-container">
                        <cui-dropdown-menu data-ng-if="$ctrl.actions.length">
                            <cui-dropdown-menu-button
                                ng-include="'app/ui-components/icons/button-action.html'">
                            </cui-dropdown-menu-button>
                            <cui-dropdown-menu-body>
                                <div class="oui-action-menu"
                                    data-ng-repeat="actionGroup in $ctrl.actions track by $index">
                                    <div class="oui-action-menu__item oui-action-menu-item"
                                        data-ng-repeat="action in actionGroup track by $index">
                                        <div class="oui-action-menu-item__icon"></div>
                                        <button class="oui-button oui-button_link oui-action-menu-item__label"
                                            type="button"
                                            data-ng-bind="action.text"
                                            data-ng-click="action.run()"></button>
                                    </div>
                                </div>
                            </cui-dropdown-menu-body>
                        </cui-dropdown-menu>
                    </div>
                    <div class="cui-accordion__button-container">
                        <button type="button"
                            aria-label="$ctrl.ariaLabel"
                            aria-pressed="{{$ctrl.expanded}}"
                            class="cui-accordion__button"
                            data-ng-click="$ctrl.toggle()">
                            <i class="oui-icon oui-icon-chevron-down cui-accordion__button-icon" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="cui-accordion__body">
                    <div class="cui-accordion__content"
                        data-ng-transclude></div>
                </div
            </div>`,
        controller: class CuiAccordionCtrl {
            $onInit () {
                if (!this.expanded && this.expanded !== false) {
                    this.expanded = false;
                }

                if (!this.ariaLabel) {
                    this.ariaLabel = "Actions";
                }
            }

            toggle () {
                if (this.expanded) {
                    this.expanded = false;
                } else {
                    this.expanded = true;
                }
            }
        },
        controllerAs: "$ctrl",
        replace: true,
        restrict: "E",
        scope: true,
        bindToController: {
            title: "<",
            text: "<",
            expanded: "<",
            actions: "<",
            ariaLabel: "@"
        }
    }));
