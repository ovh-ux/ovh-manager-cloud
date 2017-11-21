/**
 * @ngdoc directive
 * @name cuiWizardStep
 * @module components.wizardStep
 *
 * @description
 *
 * Used to create a single step in a more complex wizard step process (should be used directly inside a wizardForm)
 *
 * @usage
 *
 * ### Attributes
 * - `step-title` : title of the step contained inside its header
 * - `step-disabled` _(optional)_ : condition that makes this step disabled
 * - `step-on-init` : initialization function to be launched (only if step is not disabled rn)
 * - `step-loaded` _(optional)_ : condition that makes this step loaded, the aim is to display a loader if not
 * - `step-completed` : condition that makes this step completed, triggering the `step-on-complete` function
 * - `step-on-complete` : final function which is called after the step completion
 **/

angular.module("managerApp")
    .component("cuiWizardStep", {
        restrict: "EA",
        templateUrl: "app/ui-components/wizardStep/wizardStep.html",
        bindings: {
            stepTitle: "@stepTitle",
            stepDisabledCondition: "<?stepDisabled",
            stepInitFunction: "&stepOnInit",
            stepLoadedCondition: "<?stepLoaded",
            stepCompletedCondition: "<stepCompleted",
            stepCompletedFunction: "&stepOnComplete"
        },
        controllerAs: "$ctrl",
        transclude: true,
        controller: class cuiWizardStepController {
            $onInit () {
                this.stepDisabledCondition = this.stepDisabledCondition || false;
                this.stepLoadedCondition = this.stepLoadedCondition || true;
            }

            $onChanges () {
                if (typeof this.stepDisabledCondition !== "undefined" && this.stepCompletedCondition) {
                    this.stepCompletedFunction();
                }
            }
        }
    });
