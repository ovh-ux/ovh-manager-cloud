class CuiTileActionMenuController {
    $onInit () {
        if (this.actions && !_.isArray(this.actions)) {
            this.actions = [this.actions];
        }
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
                <div class="cui-tile__body" data-ng-if="!$ctrl.loading">
                    <ng-transclude></ng-transclude>
                </div>
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
    .component("cuiTileItem", {
        template: `
            <div data-ng-class="{ 'cui-dropdown-menu-container': $ctrl.actions }">
                <cui-tile-definitions data-ng-if="$ctrl.term">
                    <cui-tile-definition-term data-term="$ctrl.term"></cui-tile-definition-term>
                    <cui-tile-definition-description data-description="$ctrl.description"></cui-clipboard>
                </cui-tile-definitions>
                <ng-transclude></ng-transclude>
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
    .component("cuiTileActionMenu", {
        template: `
            <cui-dropdown-menu data-ng-if="$ctrl.hasAvailableAction()">
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item" data-ng-repeat="action in $ctrl.actions track by $index">
                            <div class="oui-action-menu-item__icon"></div>
                            <a class="oui-button oui-button_link oui-action-menu-item__label" data-ng-if="action.href"
                                href="{{ action.href }}"
                                data-ng-disabled="!action.isAvailable()"
                                target="_blank">
                                <span data-ng-bind="action.text"></span>
                            </a>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" data-ng-if="action.callback"
                                type="button"
                                data-ng-disabled="!action.isAvailable()"
                                data-ng-bind="action.text"
                                data-ng-click="action.callback()"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`,
        transclude: true,
        controller: CuiTileActionMenuController,
        bindings: {
            actions: "<"
        }
    })
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
            <dt class="cui-tile__term" data-ng-bind="$ctrl.term"></dt>`,
        bindToController: {
            term: "<"
        }
    }))
    .directive("cuiTileDefinitionDescription", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTileDefinitionDescriptionCtrl {},
        scope: true,
        transclude: true,
        template: `
            <dd class="cui-tile__description">
                <span data-ng-if="$ctrl.description !== null && $ctrl.description !== ''" data-ng-bind="$ctrl.description"></span>
                <span data-ng-if="$ctrl.description === null || $ctrl.description === ''" data-ng-bind="'-'"></span>
                <ng-transclude></ng-transclude>
            </dd>`,
        bindToController: {
            description: "<"
        }
    }));
