(() => {
    "use strict";

    class CuiClipboardController {
        constructor ($timeout) {
            this.$timeout = $timeout;

            this.options = {
                action: "copy",
                status: "initial"
            };
        }

        onTextFocus ($event) {
            $event.target.select();
            this.copyText();
        }

        copyText () {
            let succeeded;

            try {
                succeeded = document.execCommand(this.options.action);
            } catch (err) {
                this.error = err;
                succeeded = false;
            }

            this.handleResult(succeeded);
            this.$timeout(() => this.reset(), 2000);
        }

        handleResult (succeeded) {
            this.options.status = succeeded ? "success" : "error";
        }

        reset () {
            this.options.status = "initial";
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
                    <span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'initial'"><i class="oui-icon oui-icon-help_circle aria-hidden="true"></i></span>
                    <span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'success'"><i class="oui-icon oui-icon-success_circle aria-hidden="true"></i></span>
                    <span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'error'"><i class="oui-icon oui-icon-error_circle aria-hidden="true"></i></span>
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
