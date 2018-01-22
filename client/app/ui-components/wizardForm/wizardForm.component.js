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
 * - `form-on-cancel` : function which is called for cancel action
 * - `form-on-complete` : final function which is called after the wizard form completion
 **/
 class cuiWizardFormController {
    constructor ($scope) {
        this.$scope = $scope;

        this.$scope.$on("completeStep", (e, data) => {
            const stepIndex = this.steps.findIndex(x => x.id === data.id);
            this.steps[stepIndex].status = data.condition && "complete" || this.steps[stepIndex].status === "complete" && "error" || "active";
            if (stepIndex < (this.steps.length - 1)) {
                // Triggers the next step loading
                for (let i = stepIndex + 1; i < this.steps.length; i++) {
                    this.steps[i].status = "disabled";
                }
                if (data.condition) {
                    this.steps[stepIndex + 1].status = "active";
                }
            }
            this.formCompletedCondition = this.steps.filter(x => x.status === "complete").length === this.steps.length;
        });
    }

    $onInit () {
        this.formSubmittedCondition = this.formSubmittedCondition || false;
        this.formLoadedCondition = this.formLoadedCondition || true;
        this.formCompletedCondition = this.formCompletedCondition || false;

        this.formInitFunction();

        this.steps = [];
    }

    createStep (childScope) {
        const step = {
            id: childScope.$scope.$id,
            status: !this.steps.length ? "active" : "disabled"
        };
        this.steps.push(step);
        childScope.step = step;
    }
}

angular.module("managerApp")
    .component("cuiWizardForm", {
        restrict: "EA",
        templateUrl: "app/ui-components/wizardForm/wizardForm.html",
        bindings: {
            formTitle: "@formTitle",
            formInitFunction: "&formOnInit",
            formLoadedCondition: "<?formLoaded",
            formSubmittedCondition: "<?formSubmitted",
            formCompletedCondition: "<formCompleted",
            formCancelledFunction: "&formOnCancel",
            formCompletedFunction: "&formOnComplete",
            formCompletedText: "@formCompletedText"
        },
        controllerAs: "$ctrl",
        transclude: true,
        controller: cuiWizardFormController
    });
