angular.module("managerApp")
    .component("cuiBackLink", {
        template: `
            <a data-ui-state="$ctrl.state"
                data-ui-state-params="$ctrl.stateParams"
                class="oui-button oui-button_link oui-button_icon-left">
                <i class="oui-icon oui-icon-chevron-left" aria-hidden="true"></i><span data-ng-bind="$ctrl.text"></span>
            </a>
        `,
        controller: class CuiBackLinkController {
            $onInit () {
                if (!_.isString(this.stateParams)) {
                    this.stateParams = JSON.stringify(this.stateParams);
                }
            }
        },
        controllerAs: "$ctrl",
        bindings: {
            state: "@",
            stateParams: "<",
            text: "<"
        }
    });
