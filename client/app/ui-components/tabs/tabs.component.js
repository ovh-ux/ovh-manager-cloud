angular.module("managerApp")
    .component("cuiTabs", {
        template: `
            <ul class="cui-tabs"
                role="menubar"
                data-ng-transclude></ul>
        `,
        controllerAs: "$ctrl",
        controller: class cuiTabsController {
            constructor (TabsService) {
                this.TabsService = TabsService;
            }

            $onInit () {
                this.tabs = [];
            }

            addTab (tab) {
                this.TabsService.registerTab(tab);
                this.tabs = this.TabsService.getRegisteredTabs();
            }
        },
        transclude: true
    })
    .directive("cuiTab", () => ({
        replace: true,
        restrict: "E",
        require: ["^^cuiTabs", "cuiTab"],
        controllerAs: "$ctrl",
        controller: class CuiTabController {
            constructor ($timeout) {
                this.active = false;
                this.isActivating = false;
                this.updateActive = tabAttr => {
                    this.active = tabAttr.active;
                    this.isActivating = tabAttr.isActivating;

                    if (tabAttr.isActivating) {
                        $timeout(() => {
                            tabAttr.isActivating = false;
                            this.updateActive(tabAttr);
                        }, 200);
                    }
                };
            }
        },
        scope: true,
        transclude: true,
        template: `
            <li class="cui-tabs__tab"
                role="menuitem"
                data-ng-class="{ 'cui-tabs__tab_active': $ctrl.active, 'cui-tabs__tab_animate': $ctrl.isActivating }">
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
        },
        link: ($scope, $element, $attrs, $ctrls) => {
            const parentCtrl = $ctrls[0];
            const childCtrl = $ctrls[1];
            let tabAttr = _.pick(childCtrl, ["active", "state", "stateParams", "text"]);

            // We purge undefined attributes from the object.
            tabAttr = _.pick(tabAttr, _.identity);

            tabAttr.updateActive = (active, isActivating) => {
                tabAttr.active = active;
                tabAttr.isActivating = isActivating;
                childCtrl.updateActive(tabAttr);
            };

            parentCtrl.addTab(tabAttr);
        }
    }));
