angular.module("managerApp")
    .component("cuiProgress", {
        template: `
            <div>
                <div class="oui-progress {{ 'oui-progress_' + $ctrl.type }}" 
                    data-ng-if="$ctrl.value">
                    <div class="oui-progress__bar {{ 'oui-progress__bar_' + $ctrl.type }}" 
                        role="progressbar" 
                        style="width: {{ $ctrl.value }}%" 
                        aria-valuenow="{{ $ctrl.value }}" 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                        <span class="oui-progress__label" data-ng-bind="$ctrl.label"></span>
                    </div>
                </div>
                <div data-ng-if="!$ctrl.value" 
                    class="oui-progress {{ 'oui-progress_' + $ctrl.type }} oui-progress_indeterminate" 
                    role="progressbar" 
                    aria-valuemin="0" 
                    aria-valuemax="100"></div>
            </div>
        `,
        bindings: {
            type: "@",
            label: "<",
            value: "<"
        }
    });
