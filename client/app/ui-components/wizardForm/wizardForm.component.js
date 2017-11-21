/**
 * @ngdoc component
 * @name cuiWizardForm
 * @module components.wizardForm
 *
 * @description
 *
 * Used to create a wizard form containing steps
 *
 * @usage
 *
 * ### Attributes
 * - `form-title` : title of the step contained inside its header
 * - `form-disabled` _(optional)_ : condition that makes this step disabled
 * - `form-on-init` : initialization function to be launched
 * - `form-loaded` _(optional)_ : condition that makes this step loaded, the aim is to display a loader if not
 * - `form-completed` : condition that makes this step completed, triggering the `form-on-complete` function
 * - `form-on-complete` : final function which is called after the wizard form completion
 **/

angular.module("managerApp")
    .component("cuiWizardForm", {
        restrict: "EA",
        templateUrl: "app/ui-components/wizardForm/wizardForm.html",
        bindings: {
            formTitle: "@formTitle",
            formDisabledCondition: "<?formDisabled",
            formInitFunction: "&formOnInit",
            formLoadedCondition: "<?formLoaded",
            formCompletedCondition: "<formCompleted",
            formCancelledFunction: "<formCancelled",
            formCompletedFunction: "&formOnComplete"
        },
        controllerAs: "$ctrl",
        transclude: true,
        controller: class cuiWizardFormController {
            $onInit () {
                this.formDisabledCondition = this.formDisabledCondition || false;
                this.formLoadedCondition = this.formLoadedCondition || true;
            }
        }
    });
