class IpLoadBalancerTaskCtrl {
  constructor($scope, $stateParams, CucControllerHelper, CucCloudPoll, IpLoadBalancerTaskService,
    CucServiceHelper) {
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.CucControllerHelper = CucControllerHelper;
    this.CucCloudPoll = CucCloudPoll;
    this.IpLoadBalancerTaskService = IpLoadBalancerTaskService;
    this.CucServiceHelper = CucServiceHelper;

    this.serviceName = this.$stateParams.serviceName;

    this.tasks = this.CucControllerHelper.request.getArrayLoader({
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
    this.CucControllerHelper.modal.showModal({
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
