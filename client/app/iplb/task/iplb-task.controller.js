class IpLoadBalancerTaskCtrl {
    constructor ($scope, $stateParams, ControllerHelper, CloudPoll, IpLoadBalancerTaskService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.CloudPoll = CloudPoll;
        this.IpLoadBalancerTaskService = IpLoadBalancerTaskService;

        this.serviceName = this.$stateParams.serviceName;

        this.tasks = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerTaskService.getTasks(this.serviceName),
            successHandler: () => this.startTaskPolling()
        });

        this.$scope.$on("$destroy", () => this.stopTaskPolling());
    }

    $onInit () {
        this.tasks.load();
    }

    startTaskPolling () {
        this.stopTaskPolling();

        this.poller = this.CloudPoll.pollArray({
            items: this.tasks.data,
            pollFunction: task => this.IpLoadBalancerTaskService.getTask(this.serviceName, task.id),
            stopCondition: task => _.includes(["done", "error"], task.status)
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    showTaskPreview (task) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/task/preview/iplb-task-preview.html",
                controller: "IpLoadBalancerTaskPreviewCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    task: () => task
                }
            }
        });
    }

    actionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-eye"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_preview_see' | translate"
                                data-ng-click="ctrl.showTaskPreview($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            <cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerTaskCtrl", IpLoadBalancerTaskCtrl);
