class CuiTileActionMenuController {
    $onInit () {
        if (this.actions && !_.isArray(this.actions)) {
            this.actions = [this.actions];
        }
    }

    getActionStateParamString (action) {
        return JSON.stringify(action.stateParams);
    }

    hasAvailableAction () {
        return this.actions && _.find(this.actions, action => action.isAvailable());
    }
}

angular.module("managerApp")
    .directive("cuiTile", () => ({
        template: `
            <div class="cui-tile">
                <h4 class="oui-header_4 cui-tile__title" data-ng-bind="$ctrl.title"></h4>
                <div class="cui-tile__body" data-ng-if="$ctrl.loading">
                    <div class="cui-tile__item">
                        <div class="cui-tile__definition">
                            <cui-skeleton loading="true" data-width="20%"></cui-skeleton>
                            <cui-skeleton loading="true" data-width="60%"></cui-skeleton>
                        </div>
                    </div>
                    <div class="cui-tile__item">
                        <div class="cui-tile__definition">
                            <cui-skeleton loading="true" data-width="20%"></cui-skeleton>
                            <cui-skeleton loading="true" data-width="60%"></cui-skeleton>
                        </div>
                    </div>
                    <div class="cui-tile__item">
                        <div class="cui-tile__definition">
                            <cui-skeleton loading="true" data-width="20%"></cui-skeleton>
                            <cui-skeleton loading="true" data-width="60%"></cui-skeleton>
                        </div>
                    </div>
                </div>
                <div data-ng-transclude data-ng-if="!$ctrl.loading"></div>
            </div>
        `,
        controller: class CuiTileCtrl {},
        controllerAs: "$ctrl",
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true,
        bindToController: {
            title: "<",
            loading: "<"
        }
    }))
    .directive("cuiTileBody", () => ({
        template: `
            <div class="cui-tile__body">
                <ng-transclude></ng-transclude>
            </div>
        `,
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true
    }))
    .directive("cuiTileBodyList", () => ({
        template: `
            <ul class="cui-tile__body cui-tile__body_list" ng-transclude>
            </ul>
        `,
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true
    }))
    .directive("cuiTileBodyListItem", () => ({
        template: `
            <li class="cui-tile__item cui-tile__item_button">
                <cui-tile-definitions data-ng-if="$ctrl.term">
                    <cui-tile-definition-term data-term="$ctrl.term"></cui-tile-definition-term>
                    <cui-tile-definition-description data-description="$ctrl.description"></cui-clipboard>
                </cui-tile-definitions>
                <ng-transclude></ng-transclude>
                <cui-tile-action-menu data-ng-if="$ctrl.actions" data-actions="$ctrl.actions"></cui-tile-action-menu>
            </li>
        `,
        transclude: true,
        replace: true,
        restrict: "E",
        scope: true,
        controllerAs: "$ctrl",
        controller: class cuiTileBodyListItemController {},
        bindToController: {
            term: "<",
            description: "<",
            actions: "<"
        }
    }))
    .component("cuiTileItem", {
        template: `
            <div class="d-flex" data-ng-class="{ 'cui-dropdown-menu-container': $ctrl.actions }">
                <div class="cui-tile__item-main" data-ng-if="$ctrl.term">
                    <cui-tile-definitions data-ng-if="$ctrl.term">
                        <cui-tile-definition-term data-term="$ctrl.term"><ng-transclude></ng-transclude></cui-tile-definition-term>
                        <cui-tile-definition-description data-description="$ctrl.description"></cui-tile-definition-description>
                    </cui-tile-definitions>
                </div>
                <div class="cui-tile__item-main" data-ng-if="!$ctrl.term && !$ctrl.description" data-ng-transclude></div>
                <cui-tile-action-menu data-ng-if="$ctrl.actions" data-actions="$ctrl.actions"></cui-tile-action-menu>
            </div>`,
        controller:
            class cuiTileItemController {
                constructor ($element) {
                    this.$element = $element;
                }

                $postLink () {
                    this.$element.addClass("cui-tile__item");
                }
            },
        transclude: true,
        bindings: {
            term: "<",
            description: "<",
            actions: "<"
        }
    })
    .directive("cuiTileActionMenu", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        transclude: true,
        controller: CuiTileActionMenuController,
        scope: true,
        template: `
            <div>
                <oui-dropdown class="oui-dropdown_action-menu cui-tile__item-button"
                    data-align="end"
                    data-arrow
                    data-ng-if="$ctrl.hasAvailableAction()">
                    <button
                        class="oui-action-button"
                        data-oui-dropdown-trigger>
                        <svg xmlns="http://www.w3.org/2000/svg" viewbox="-1 -1 74 74">
                            <circle cx="22.27" cy="36" r="4"></circle>
                            <circle cx="36.20" cy="36" r="4"></circle>
                            <circle cx="50.13" cy="36" r="4"></circle>
                        </svg>
                    </button>
                    <oui-dropdown-content>
                        <div data-ng-repeat="action in $ctrl.actions track by $index">
                            <oui-dropdown-item
                                data-ng-if="action.href"
                                href="{{ ::action.href }}"
                                disabled="action.isAvailable && !action.isAvailable()"
                                target="_blank"
                                data-text="{{ ::action.text }}">
                            </oui-dropdown-item>
                            <oui-dropdown-item
                                data-ng-if="action.state"
                                data-state="{{action.state}}"
                                disabled="action.isAvailable && !action.isAvailable()"
                                data-text="{{ ::action.text }}">
                            </oui-dropdown-item>
                            <oui-dropdown-item
                                data-ng-if="action.callback"
                                disabled="action.isAvailable && !action.isAvailable()"
                                data-text="{{ ::action.text }}"
                                data-on-click="action.callback()">
                            </oui-dropdown-item>
                        </div>
                    </oui-dropdown-content>
                </oui-dropdown>
            </div>`,
        bindToController: {
            actions: "<"
        }
    }))
    .directive("cuiTileActionLink", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionsCtrl {
            getActionStateParamString () {
                if (!this.action.stateParams) { return ""; }
                return `(${JSON.stringify(this.action.stateParams)})`;
            }
        },
        scope: true,
        template: `
            <div>
                <button data-ng-if="$ctrl.action.callback || ($ctrl.action.isAvailable && !$ctrl.action.isAvailable())"
                    class="oui-button oui-button_link oui-button_full-width cui-tile__button cui-tile__link"
                    data-ng-click="$ctrl.action.callback()"
                    data-ng-class="{ 'cui-tile__link_disabled': $ctrl.disabled }"
                    data-ng-disabled="$ctrl.action.isAvailable && !$ctrl.action.isAvailable()">
                    <span data-ng-bind="$ctrl.action.text"></span>
                    <i class="oui-icon oui-icon-external_link ml-1" data-ng-if="$ctrl.action.isExternal" aria-hidden="true"></i>
                </button>
                <a data-ng-if="$ctrl.action.state && (!$ctrl.action.isAvailable || $ctrl.action.isAvailable())"
                    data-ng-class="{ 'cui-tile__link_disabled': $ctrl.disabled }"
                    class="oui-button oui-button_link oui-button_full-width cui-tile__button cui-tile__link"
                    data-ui-sref="{{ $ctrl.action.state + $ctrl.getActionStateParamString() }}"
                    ng-attr-target="{{($ctrl.action.isExternal) ? '_blank' : undefined}}">
                    <span data-ng-bind="$ctrl.action.text"></span>
                    <i class="oui-icon oui-icon-external_link ml-1" data-ng-if="$ctrl.action.isExternal" aria-hidden="true"></i>
                </a>
                <a data-ng-if="$ctrl.action.href && (!$ctrl.action.isAvailable || $ctrl.action.isAvailable())"
                    data-ng-class="{ 'cui-tile__link_disabled': $ctrl.disabled }"
                    class="oui-button oui-button_link oui-button_full-width cui-tile__button"
                    data-at-internet-click="{ name: $ctrl.action.atInternetClickTag }"
                    data-ng-href="{{ $ctrl.action.href }}"
                    ng-attr-target="{{($ctrl.action.isExternal) ? '_blank' : undefined}}">
                    <span data-ng-bind="$ctrl.action.text"></span>
                    <span class="oui-icon oui-icon-external_link" data-ng-if="$ctrl.action.isExternal" aria-hidden="true"></span>
                </a>
                <ng-transclude></ng-transclude>
            </div>`,
        transclude: true,
        bindToController: {
            action: "<",
            disabled: "<"
        }
    }))
    .directive("cuiTileDefinitions", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionsCtrl {},
        scope: true,
        template: `
            <dl class="cui-tile__definition" data-ng-transclude></dl>`,
        transclude: true
    }))
    .directive("cuiTileDefinitionTerm", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionTermCtrl {},
        scope: true,
        template: `
            <dt class="cui-tile__term">
                {{$ctrl.term}}
                <ng-transclude></ng-transclude>
            </dt>`,
        bindToController: {
            term: "<"
        },
        transclude: true
    }))
    .directive("cuiTileDefinitionDescription", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionDescriptionCtrl {},
        scope: true,
        transclude: true,
        template: `
            <dd class="cui-tile__description text-truncate">
                <span data-ng-if="$ctrl.description !== null && $ctrl.description !== ''" data-ng-bind="$ctrl.description"></span>
                <span data-ng-if="$ctrl.description === null || $ctrl.description === ''" data-ng-bind="'-'"></span>
                <ng-transclude></ng-transclude>
            </dd>`,
        bindToController: {
            description: "<"
        }
    }));
