angular.module("managerApp")
    .component("cuiSubmitButton", {
        template: `
            <oui-button variant="primary"
                type="submit"
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
            <oui-button variant="secondary"
                type="button"
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
