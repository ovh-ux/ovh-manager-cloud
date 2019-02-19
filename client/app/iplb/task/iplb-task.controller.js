class IpLoadBalancerTaskCtrl {
  constructor($scope, $stateParams, ControllerHelper, CucCloudPoll, IpLoadBalancerTaskService,
    ServiceHelper) {
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.ControllerHelper = ControllerHelper;
    this.CucCloudPoll = CucCloudPoll;
    this.IpLoadBalancerTaskService = IpLoadBalancerTaskService;
    this.ServiceHelper = ServiceHelper;

    this.serviceName = this.$stateParams.serviceName;

    this.tasks = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.IpLoadBalancerTaskService.getTasks(this.serviceName),
      successHandler: () => this.startTaskPolling(),
    });

    this.$scope.$on('$destroy', () => this.stopTaskPolling());
  }

  $onInit() {
    this.tasks.load();
  }

  startTaskPolling() {
    this.stopTaskPolling();

    this.poller = this.CucCloudPoll.pollArray({
      items: this.tasks.data,
      pollFunction: task => this.IpLoadBalancerTaskService.getTask(this.serviceName, task.id),
      stopCondition: task => _.includes(['done', 'error'], task.status),
    });
  }

  stopTaskPolling() {
    if (this.poller) {
      this.poller.kill();
    }
  }

  showTaskPreview(task) {
    this.ControllerHelper.modal.showModal({
      modalConfig: {
        templateUrl: 'app/iplb/task/preview/iplb-task-preview.html',
        controller: 'IpLoadBalancerTaskPreviewCtrl',
        controllerAs: '$ctrl',
        resolve: {
          task: () => task,
        },
      },
    });
  }
}

angular.module('managerApp').controller('IpLoadBalancerTaskCtrl', IpLoadBalancerTaskCtrl);
