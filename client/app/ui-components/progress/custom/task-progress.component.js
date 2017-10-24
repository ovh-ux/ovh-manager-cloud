angular.module("managerApp")
    .component("cuiTaskProgress", {
        template: `
            <div>
                <cui-progress data-ng-if="$ctrl.canDisplayBar()" 
                    data-label="($ctrl.task.progress || $ctrl.task.percentage) + '%'"
                    data-value="$ctrl.task.progress || $ctrl.task.percentage"
                    data-type="{{ $ctrl.type }}"></cui-progress>
            </div>
        `,
        controller:
            class CuiTaskProgressController {
                constructor ($scope) {
                    this.$scope = $scope;
                }

                canDisplayBar () {
                    return !_.isNaN(_.get(this.task, "progress") || _.get(this.task, "percentage")) && _.get(this.task, "status");
                }

                $onInit () {
                    this.$scope.$watch(() => _.get(this.task, "status"), () => this.refreshType());
                }

                refreshType () {
                    switch ((this.task || {}).status) {
                        case "done":
                            this.type = "success";
                            break;
                        case "error":
                            this.type = "error";
                            break;
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
