angular.module("managerApp")
    .component("cuiTabs", {
        template: `
            <ul class="cui-tabs" data-ng-transclude></ul>
        `,
        transclude: true
    })
    .directive("cuiTab", () => ({
        replace: true,
        restrict: "E",
        controllerAs: "$ctrl",
        controller: class CuiTabController {
            constructor ($state) {
                this.$state = $state;
            }

            isActive () {
                return this.state ? this.$state.includes(this.state) : this.active;
            }
        },
        scope: true,
        transclude: true,
        template: `
            <li class="cui-tabs__tab"
                data-ng-class="{ 'cui-tabs__tab_active': $ctrl.isActive() }">
                <ng-transclude data-ng-if="!$ctrl.state"></ng-transclude>
                <a data-ng-if="$ctrl.state"
                   ui-sref="{{ $ctrl.state + '(' + String($ctrl.stateParams) + ')' }}">
                   <span data-ng-bind="$ctrl.text"></span>
                </a>
            </li>
        `,
        bindToController: {
            active: "<",
            state: "@",
            stateParams: "<",
            text: "<"
        }
    }));
