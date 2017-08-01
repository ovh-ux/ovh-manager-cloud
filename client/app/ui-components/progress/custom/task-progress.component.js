angular.module("managerApp")
    .component("cuiTaskProgress", {
        template: `
            <cui-progress data-label="$ctrl.task.progress + '%'"
                data-value="$ctrl.task.progress"
                data-type="{{ $ctrl.type }}"></cui-progress>
        `,
        controller:
            class CuiTaskProgressController {
                constructor ($scope) {
                    this.$scope = $scope;
                }

                $onInit () {
                    this.$scope.$watch("this.task.status", () => this.refreshType());
                }

                refreshType () {
                    switch ((this.task || {}).status) {
                        case "done":
                            this.type = "success";
                            break;
                        case "error":
                            this.type = "error";
                        case "doing":
                        case "todo":
                        case "paused":
                            this.type = "info";
                            break;
                        default:
                            this.type = "warning";
                            break;
                    }
                }
            },
        bindings: {
            task: "<"
        }
    });
