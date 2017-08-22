(() => {
    "use strict";

    class CuiClipboardController {
        onTextFocus ($event) {
            $event.target.select();
        }
    }

    angular.module("managerApp")
        .component("cuiClipboard", {
            template: `
                <div class="cui-clipboard">
                    <input class="cui-clipboard__input"
                        type="text"
                        data-ng-focus="$ctrl.onTextFocus($event)"
                        data-ng-value="$ctrl.text"
                        readonly>
                </div>
                `,
            controller: CuiClipboardController,
            bindings: {
                text: "<"
            }
        })
        .component("cuiClipboardList", {
            template: `
                <div class="cui-clipboard-list">
                    <div class="cui-clipboard-list__item">   
                        <ng-transclude></ng-transclude>
                    </div>
                </div>
            `,
            controller: CuiClipboardController,
            transclude: true,
            bindings: {
                text: "<"
            }
        });
})();
