angular.module("managerApp")
    .component("cuiModal", {
        template: `
            <div class="oui-modal oui-modal_shadow">
                <ng-transclude></ng-transclude>
            </div>
        `,
        transclude: true,
        bindings: {
            onDismiss: "&"
        }
    })
    .component("cuiModalHeader", {
        template: `
            <div class="oui-modal__header">
                <button class="oui-icon oui-icon-close_thin oui-modal__close-button"
                    type="button"
                    aria-label="Exit" data-ng-click="$ctrl.onDismiss()"></button>
            </div>
        `,
        bindings: {
            onDismiss: "&"
        }
    })
    .component("cuiModalBody", {
        template: `
            <div class="oui-modal__body" data-ng-class="{ 'oui-modal__body_no-icon': !$ctrl.icon }">
                <i class="oui-icon oui-icon-{{ $ctrl.icon }}_circle oui-icon_bicolor"
                    aria-hidden="true"
                    data-ng-if="$ctrl.icon"></i>
                <h2 class="oui-modal__title" data-ng-bind="$ctrl.title"></h2>
                <div class="oui-modal__text" data-ng-transclude></div>
            </div>
        `,
        transclude: true,
        bindings: {
            icon: "@",
            title: "<"
        }
    })
    .component("cuiModalText", {
        template: `
            <p class="oui-modal__text" data-ng-if="$ctrl.text" data-ng-bind-html="$ctrl.text"></p>
            <p class="oui-modal__text" data-ng-if="!$ctrl.text" data-ng-transclude></p>
        `,
        transclude: true,
        bindings: {
            text: "<"
        }
    })
    .component("cuiModalFooter", {
        template: `
            <div class="oui-modal__footer">
                <ng-transclude></ng-transclude>
            </div>
        `,
        transclude: true
    });
