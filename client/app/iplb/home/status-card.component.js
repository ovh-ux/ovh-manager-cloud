angular.module("managerApp")
    .directive("iplbStatusCard", () => ({
        template: `
            <div class="cui-status-card cui-dropdown-menu-container">
                <div class="cui-status-card__header">
                    <cui-status-icon class="cui-status-card__icon" data-type="{{$ctrl.type}}"></cui-status-icon>
                    <div class="cui-status-card__header-middle">
                        <div class="cui-status-card__title"
                            data-ng-bind="$ctrl.title"></div>
                        <cui-skeleton loading="this.loading" data-width="50%">
                            <div class="cui-status-card__subtitle"
                                data-ng-repeat="subtitle in $ctrl.getSubtitle()"
                                data-ng-bind="subtitle"></div>
                        </cui-skeleton>
                    </div>
                    <div class="cui-status-card__button-container">
                        <cui-dropdown-menu data-ng-if="$ctrl.actions.length">
                            <cui-dropdown-menu-button>
                                <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
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
                </div>
                <div class="cui-status-card__content" data-ng-transclude></div>
            </div>

            `,
        transclude: true,
        replace: true,
        restrict: "E",
        controller: class {
            getSubtitle () {
                if (!_.isArray(this.subtitle)) {
                    return [this.subtitle];
                }
                return this.subtitle;
            }
        },
        controllerAs: "$ctrl",
        scope: true,
        bindToController: {
            type: "<",
            title: "<",
            subtitle: "<",
            actions: "<",
            loading: "<"
        }
    }));
