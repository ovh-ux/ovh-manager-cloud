(() => {
    "use strict";

angular.module("managerApp")
    .component("cuiRadioBar", {
        transclude: true,
        template: '<ul class="cui-radio-bar cui-radio-bar_wrappable" data-ng-transclude></ul>',
        bindings: {
            name: "@",
            ngModel: "="
        }
    })
    .directive("cuiRadioBarItem", () => ({
        replace: true,
        restrict: "E",
        require: {
            parent: "^cuiRadioBar"
        },
        template: `
          <li class="cui-radio-item">
            <input class="cui-radio-item__input screen-reader"
               type="radio"
               id="{{$ctrl.parent.name}}_{{$ctrl.value}}"
               name="{{$ctrl.parent.name || $ctrl.parent.ngModel}}"
               value="{{$ctrl.value}}"
               data-ng-model="$ctrl.parent.ngModel">
            <label class="cui-radio-item__label"
               for="{{$ctrl.parent.name}}_{{$ctrl.value}}"
               data-ng-bind="$ctrl.text"></label>
          </li>`,
        controller: () => {}, // eslint-disable-line no-empty-function
        controllerAs: "$ctrl",
        scope: true,
        bindToController: {
            text: "<",
            value: "<"
        }
    }));
})();