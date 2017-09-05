angular.module("managerApp")
    .component("cuiStatusIcon", {
        template: `
            <i class="cui-status-icon_{{$ctrl.type}} oui-icon oui-icon-{{$ctrl.type}}_circle"></i>
        `,
        bindings: {
            type: "@"
        }
    });
