class VpsTaskService {
  constructor($http, $q, $rootScope, $translate, CucCloudMessage, CucOvhPoll) {
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;

    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.CucOvhPoll = CucOvhPoll;

    this.COMPLETED_TASK_PROGRESS = 100;
  }

  initPoller(serviceName, containerName) {
    this.getPendingTasks(serviceName)
      .then(tasks => this.startTaskPolling(serviceName, containerName, tasks));
  }

  getPendingTasks(serviceName, type) {
    return this.$http.get(['/sws/vps', serviceName, 'tasks/uncompleted'].join('/'), {
      serviceType: 'aapi',
      params: {
        type,
      },
    })
      .then(data => data.data)
      .catch(error => this.$q.reject(error.data));
  }

  getTask(serviceName, taskId) {
    return this.$http.get(['/vps', serviceName, 'tasks', taskId].join('/'))
      .then(data => data.data)
      .catch(error => this.$q.reject(error.data))
      .finally(() => this.$rootScope.$broadcast('tasks.pending', serviceName));
  }

  startTaskPolling(serviceName, containerName, tasks) {
    this.stopTaskPolling();

    this.poller = this.CucOvhPoll.pollArray({
      items: tasks,
      pollFunction: task => this.getTask(serviceName, task.id),
      stopCondition: task => _.includes(['done', 'error'], task.state),
      onItemUpdated: task => this.manageMessage(containerName, task),
      onItemDone: () => this.manageSuccess(serviceName, containerName),
    });
  }

  stopTaskPolling() {
    if (this.poller) {
      this.poller.kill();
    }
  }

  manageSuccess(serviceName, containerName) {
    this.flushMessages(containerName);
    this.$rootScope.$broadcast('tasks.success', serviceName);
    this.CucCloudMessage.success(this.$translate.instant('vps_dashboard_task_finish'));
  }

  manageMessage(containerName, task) {
    this.flushMessages(containerName, task);
    if (task.progress !== this.COMPLETED_TASK_PROGRESS) {
      this.createMessage(containerName, task);
    }
  }

  createMessage(containerName, task) {
    this.CucCloudMessage.warning({
      id: task.id,
      class: 'task',
      title: this.messageType(task.type),
      textHtml: this.template(task.type, task.progress),
      progress: task.progress,
    }, containerName);
  }

  flushMessages(containerName, task) {
    _.forEach(this.CucCloudMessage.getMessages(containerName), (message) => {
      if (message.class === 'task') {
        _.set(message, 'dismissed', true);
      }
      if (task && task.id === message.id) {
        _.set(message, 'dismissed', true);
      }
    });
  }

  template(type, progress) {
    return `${this.messageType(type)} (${progress}%)`;
  }

  messageType(type) {
    return this.$translate.instant(`vps_dashboard_task_${type}`);
  }
}

angular.module('managerApp').service('VpsTaskService', VpsTaskService);
