class VpsTaskService {
    constructor ($http, $q, $rootScope, $timeout, $translate, CloudMessage) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;

        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;

        this.firstCall = true;
    }

    /*
     * imported from vps services to avoid calling this services
     * + getSelectedVps
     * + getTaskInPropgress
     */
    getSelectedVps (serviceName) {
        return this.$http.get(["/sws/vps", serviceName,"info"].join("/"), {serviceType: "aapi"})
            .then(result => result.data)
            .catch(err => this.$q.reject(err));
    }

    getTaskInProgress (serviceName, type) {
        var result = null;
        return this.getSelectedVps(serviceName).then(vps => {
            if (vps && vps.name) {
                return this.$http.get(["/sws/vps", vps.name, "tasks/uncompleted"].join("/"), {
                    serviceType: "aapi",
                    params: {
                        type: type
                    }
                }).then(data => { result = data.data; });
            } else {
                return this.$q.reject(vps);
            }
        })
        .then(() => { return result; })
        .catch(http => this.$q.reject(http.data));
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
        this.getTaskInProgress(serviceName)
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
        }

        // refresh while there's pending task
        if (!this.firstCall) {
            this.$timeout(() => {
                if (!_.isEmpty(tasks)) {
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
        if (task.progress !== 100) {
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
