(() => {
    "use strict";

    class CuiClipboardController {
        constructor ($element, $timeout) {
            this.$element = $element;
            this.$timeout = $timeout;

            this.options = {
                action: "copy",
                status: "initial"
            };
        }

        $postLink () {
            this.$element.addClass("cui-clipboard");
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
            this.options.status = succeeded ? "success" : "initial";
        }

        reset () {
            this.options.status = "initial";
        }

    }

    angular.module("managerApp")
        .component("cuiClipboard", {
            template: `
                <div class="cui-clipboard__input-container">
                    <input class="cui-clipboard__input text-truncate"
                        type="text"
                        id="{{$ctrl.id}}"
                        data-ng-focus="$ctrl.onTextFocus($event)"
                        data-ng-value="$ctrl.text"
                        readonly>
                    <span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'initial'"><i class="oui-icon oui-icon-copy-normal aria-hidden="true"></i></span>
                    <span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'success'"><i class="oui-icon oui-icon-copy-success aria-hidden="true"></i></span>
                    <!--<span class="cui-clipboard__icon" data-ng-if="$ctrl.options.status === 'error'"><i class="oui-icon oui-icon-copy-error aria-hidden="true"></i></span>-->
                </div>
                `,
            controller: CuiClipboardController,
            bindings: {
                text: "<",
                label: "<?",
                id: "@?"
            }
        });
})();
