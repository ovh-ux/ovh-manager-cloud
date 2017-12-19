class VpsTaskService {
    constructor ($http, $q, $rootScope, $timeout, $translate, CloudMessage) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;

        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;

        this.firstCall = true;
        this.COMPLETED_TASK_PROGRESS = 100;
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
     * subscribe : reset values and get pending tasks
     *
     */
    subscribe (serviceName) {
        this.firstCall = true;
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
        this.flushMessages();
        _.forEach(tasks, task => {
            this.manageMessage(task);
        });

        if (this.firstCall && !_.isEmpty(tasks)) {
            this.firstCall = false;
            this.$rootScope.$broadcast("tasks.pending");
        }

        // refresh while there's pending task
        if (!this.firstCall) {
            this.$timeout(() => {
                if (!_.isEmpty(tasks)) {
                    this.$rootScope.$broadcast("tasks.pending");
                    this.getTasks(serviceName);
                } else {
                    this.flushMessages();
                    this.$rootScope.$broadcast("tasks.success");
                    this.CloudMessage.success(this.$translate.instant("vps_dashboard_task_finish"));
                }
            }, 5000);
        }
    }

    /*
     * manageMessage : manage message to display
     *
     */
    manageMessage (task) {
        if (task.progress !== this.COMPLETED_TASK_PROGRESS) {
            this.createMessage(task);
        }
    }

    /*
     * createMessage : create a new 'task' message with HTML template
     *
     */
    createMessage (task) {
        this.CloudMessage.warning({
            id: task.id,
            class: "task",
            title: this.messageType(task.type),
            textHtml: this.template(task.type, task.progress),
            progress: task.progress
        }, "iaas.vps.detail");
    }

    /*
     * flushMessages : flush all messages that have 'task' class
     *
     */
    flushMessages () {
        _.forEach(this.CloudMessage.getMessages("iaas.vps.detail"), message => {
            if (message.class == "task") {
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
