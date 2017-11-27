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
    .directive("cuiWizardStep", () => {
        "use strict";
        return {
            restrict: "EA",
            templateUrl: "app/ui-components/wizardStep/wizardStep.html",
            scope: {
                stepTitle: "@stepTitle",
                stepDisabledCondition: "<?stepDisabled",
                stepInitFunction: "&stepOnInit",
                stepLoadedCondition: "<?stepLoaded",
                stepCompletedCondition: "<stepCompleted",
                stepCompletedFunction: "&stepOnComplete"
            },
            bindToController: true,
            controllerAs: "$ctrl",
            transclude: true,
            require: {
                cuiWizardFormController: "^cuiWizardForm"
            },
            controller: class cuiWizardStepController {
                constructor ($scope) {
                    this.$scope = $scope;
                    this.$ctrl = this.$scope && this.$scope.$ctrl;
                    this.step = this.$ctrl && this.$ctrl.step;

                    this.stepLoadedCondition = this.stepLoadedCondition || true;
                    this.stepDisabledCondition = this.stepDisabledCondition || false;
                }

                $onInit () {
                    this.$ctrl.cuiWizardFormController.createStep(this.$ctrl);
                }

                $onChanges () {
                    if (this.step && this.step.status !== "disabled") {
                        this.$scope.$emit("completeStep", {
                            id: this.step.id,
                            condition: this.stepCompletedCondition
                        });
                        this.stepCompletedCondition && this.stepCompletedFunction();
                    }
                }
            }
        };
    });
