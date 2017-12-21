class VpsTaskService {
    constructor ($http, $q, $rootScope, $timeout, $translate, CloudMessage, ControllerHelper, OvhPoll) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;

        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.OvhPoll = OvhPoll;

        this.COMPLETED_TASK_PROGRESS = 100;
    }

    initPoller (serviceName, containerName) {
        this.tasks = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.getPendingTasks(serviceName),
            successHandler: () => this.startTaskPolling(serviceName, containerName)
        });
        this.tasks.load();
    }

    getPendingTasks (serviceName, type) {
        return this.$http.get(["/sws/vps", serviceName, "tasks/uncompleted"].join("/"), {
            serviceType: "aapi",
            params: {
                type: type
            }
        })
        .then(data => data.data)
        .catch(error => this.$q.reject(error.data));
    }

    getTask(serviceName, taskId) {
        return this.$http.get(["/vps", serviceName, "tasks", taskId].join("/"))
            .then(data => data.data)
            .catch(error => this.$q.reject(error.data))
            .finally(() => this.$rootScope.$broadcast("tasks.pending", serviceName));
    }

    startTaskPolling (serviceName, containerName) {
        this.stopTaskPolling();

        this.poller = this.OvhPoll.pollArray({
            items: this.tasks.data,
            pollFunction: task => this.getTask(serviceName, task.id),
            stopCondition: task => _.includes(["done", "error"], task.state),
            onItemUpdated: task => this.manageMessage(containerName, task),
            onItemDone: () => this.manageSuccess(serviceName, containerName)
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    manageSuccess (serviceName, containerName) {
        this.flushMessages(containerName);
        this.$rootScope.$broadcast("tasks.success", serviceName);
        this.CloudMessage.success(this.$translate.instant("vps_dashboard_task_finish"));
    }

    manageMessage (containerName, task) {
        this.flushMessages(containerName, task);
        if (task.progress !== this.COMPLETED_TASK_PROGRESS) {
            this.createMessage(containerName, task);
        }
    }

    createMessage (containerName, task) {
        this.CloudMessage.warning({
            id: task.id,
            class: "task",
            title: this.messageType(task.type),
            textHtml: this.template(task.type, task.progress),
            progress: task.progress
        }, containerName);
    }

    flushMessages (containerName, task) {
        _.forEach(this.CloudMessage.getMessages(containerName), message => {
            if (message.class === "task") {
                message.dismissed = true;
            }
            if (task && task.id == message.id) {
                message.dismissed = true;
            }
        });
    }

    template (type, progress) {
        return `${this.messageType(type)} (${progress}%)`;
    }

    messageType (type) {
        return this.$translate.instant("vps_dashboard_task_"+type);
    }

}

angular.module("managerApp").service("VpsTaskService", VpsTaskService);
