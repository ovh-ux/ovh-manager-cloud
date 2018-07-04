angular.module("managerApp")
    .component("cuiSubmitButton", {
        template: `
            <oui-button data-variant="primary"
                data-type="submit"
                data-on-click="$ctrl.onClick()"
                data-disabled="$ctrl.disabled"
                data-text="{{::$ctrl.text}}"
                data-aria-label="{{::$ctrl.ariaLabel}}"
                data-id="{{::$ctrl.id}}"
                data-name="{{::$ctrl.name}}">
            </oui-button>
        `,
        bindings: {
            text: "<",
            onClick: "&",
            disabled: "<?",
            ariaLabel: "@?",
            id: "@?",
            name: "@?"
        }
    })
    .component("cuiCancelButton", {
        template: `
            <oui-button data-variant="secondary"
                data-type="button"
                data-on-click="$ctrl.onClick()"
                data-disabled="$ctrl.disabled"
                data-text="{{::$ctrl.text}}"
                data-aria-label="{{::$ctrl.ariaLabel}}"
                data-id="{{::$ctrl.id}}"
                data-name="{{::$ctrl.name}}">
            </oui-button>
        `,
        bindings: {
            text: "<",
            onClick: "&",
            disabled: "<?",
            ariaLabel: "@?",
            id: "@?",
            name: "@?"
        }
    });
