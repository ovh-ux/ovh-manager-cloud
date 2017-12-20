class VpsTaskService {
    constructor ($http, $q, $rootScope, $timeout, $translate, CloudMessage) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;

        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;

        this.subscribers = {};

        this.COMPLETED_TASK_PROGRESS = 100;
        this.TIMER = 5000;
    }

    /*
     * imported from vps services to avoid calling this services
     * + _getTaskInPropgress
     */

    _getTaskInProgress (serviceName, type) {
        return this.$http.get(["/sws/vps", serviceName, "tasks/uncompleted"].join("/"), {
            serviceType: "aapi",
            params: {
                type: type
            }
        })
        .then(data => data.data)
        .catch(error => this.$q.reject(error.data));
    }

    /*
     * unSubscribe : reset values and terminate poller
     *
     */
    unSubscribe (serviceName) {
        _.forEach(this.subscribers, element => {
            if (element && element.poller) {
                this.$timeout.cancel(element.poller);
            }
        });
        this.subscribers = _.omit(this.subscribers, serviceName);
    }

    /*
     * subscribe : assign values and get pending tasks
     *
     */
    subscribe (serviceName, containerName) {
        this.subscribers[serviceName] = {};
        this.subscribers[serviceName].firstCall = true;
        this.subscribers[serviceName].containerName = containerName;
        this.getTasks(serviceName);
    }

    /*
     * getTasks : retrieve task in progress
     *
     */
    getTasks (serviceName) {
        this._getTaskInProgress(serviceName)
            .then(tasks => this.handleTasks(serviceName, tasks))
            .catch(err => this.CloudMessage(err));
    }

    /*
     * handleTasks : manage message to display and update value while there is task in progress
     *
     */
    handleTasks (serviceName, tasks) {
        this.flushMessages(this.subscribers[serviceName].containerName);
        _.forEach(tasks, task => {
            this.manageMessage(task, this.subscribers[serviceName].containerName);
        });

        if (this.subscribers[serviceName].firstCall && !_.isEmpty(tasks)) {
            this.subscribers[serviceName].firstCall = false;
            this.$rootScope.$broadcast("tasks.pending");
        }

        // refresh while there's pending task
        if (!this.subscribers[serviceName].firstCall) {
            this.subscribers[serviceName].poller = this.$timeout(() => {
                if (!_.isEmpty(tasks)) {
                    this.$rootScope.$broadcast("tasks.pending");
                    this.getTasks(serviceName);
                } else {
                    this.flushMessages(this.subscribers[serviceName].containerName);
                    this.$rootScope.$broadcast("tasks.success");
                    this.CloudMessage.success(this.$translate.instant("vps_dashboard_task_finish"));
                }
            }, this.TIMER);
        }
    }

    /*
     * manageMessage : manage message to display
     *
     */
    manageMessage (task, containerName) {
        if (task.progress !== this.COMPLETED_TASK_PROGRESS) {
            this.createMessage(task, containerName);
        }
    }

    /*
     * createMessage : create a new 'task' message with HTML template
     *
     */
    createMessage (task, containerName) {
        this.CloudMessage.warning({
            id: task.id,
            class: "task",
            title: this.messageType(task.type),
            textHtml: this.template(task.type, task.progress),
            progress: task.progress
        }, containerName);
    }

    /*
     * flushMessages : flush all messages that have 'task' class
     *
     */
    flushMessages (containerName) {
        _.forEach(this.CloudMessage.getMessages(containerName), message => {
            if (message.class === "task") {
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
