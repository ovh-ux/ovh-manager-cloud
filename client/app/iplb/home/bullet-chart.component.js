angular.module("managerApp")
    .directive("iplbBulletChart", () => ({
        template: `
            <div class="iplb-bullet-chart iplb-bullet-chart_success"
                data-ng-class="{
                    'iplb-bullet-chart_warning': $ctrl.value >= 50,
                    'iplb-bullet-chart_error': $ctrl.value >= 75
                }">
                <div class="iplb-bullet-chart__content">
                    <div class="iplb-bullet-chart__bar" data-ng-style="{ width: $ctrl.getValue() }"></div>
                    <div class="iplb-bullet-chart__limit"
                        data-ng-if="$ctrl.limit"
                        data-ng-style="{ left: $ctrl.getLimit() }"></div>
                    <div class="iplb-bullet-chart__step25"></div>
                    <div class="iplb-bullet-chart__step50"></div>
                    <div class="iplb-bullet-chart__step75"></div>
                </div>
                <span class="iplb-bullet-chart__text"
                    data-ng-if="$ctrl.text"
                    data-ng-bind="$ctrl.text"></span>
            </div>
            `,
        restrict: "E",
        controller: class {
            getValue () {
                return `${this.value}%`;
            }

            getLimit () {
                return `${this.limit}%`;
            }
        },
        controllerAs: "$ctrl",
        scope: true,
        bindToController: {
            text: "<",
            value: "<",
            limit: "<"
        }
    }));
