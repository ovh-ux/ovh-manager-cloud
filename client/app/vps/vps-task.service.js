class VpsTaskService {
    constructor ($timeout, $translate, CloudMessage, VpsService) {
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;

        this.tasks = [];
        this.firstCall = true;
    }

    /*
     * subscribe : reset values and get pending tasks
     *
     */
    subscribe (serviceName) {
        this.tasks = [];
        this.firstCall = true;
        this.getTasks(serviceName);
    }

    /*
     * getTasks : retrieve task in progress
     *
     */
    getTasks (serviceName) {
        this.VpsService.getTaskInProgress(serviceName)
            .then(tasks => this.handleTasks(serviceName, tasks))
            .catch(err => this.CloudMessage(err));
    }

    /*
     * handleTasks : manage message to display and update value while there is task in progress
     *
     */
    handleTasks (serviceName, tasks) {
        _.forEach(tasks, task => {
            this.tasks = tasks;
            this.manageMessage(task);
        });
        // refresh while there's task in progress
        this.$timeout(() => {
            if (!_.isEmpty(tasks)) {
                this.getTasks(serviceName);
            } else {
                this.flushMessages();
                if (!this.firstCall) {
                    this.CloudMessage.success(this.$translate.instant("vps_dashboard_task_finish"));
                }
            }
            this.firstCall = false;
        }, 5000);
    }

    /*
     * manageMessage : manage message to display
     *  - update message
     *  - create message
     *
     */
    manageMessage (task) {
        _.forEach(this.CloudMessage.getMessages("iaas.vps.detail"), message => {
            if (message.class == "task" && message.id == task.id) {
                message.dismissed = true;
            }
        });
        this.createMessage(task);
    }

    /*
     * createMessage : create a new 'task' message with HTML template
     *
     */
    createMessage (task) {
        this.CloudMessage.warning({
            id: task.id,
            class: "task",
            textHtml: this.template(task.type, task.progress)
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
        return `
            <p>${this.messageType(type)}</p>
            <div class="oui-progress oui-progress_info">
                <div class="oui-progress__bar oui-progress__bar_info" role="progressbar"
                     aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"
                     style="width: ${progress}%">
                    <span class="oui-progress__label">${progress}%</span>
                </div>
            </div>
        `;
    }

    messageType (type) {
        return this.$translate.instant("vps_dashboard_task_"+type);
    }

}

angular.module("managerApp").service("VpsTaskService", VpsTaskService);
