class VpsTaskService {
    constructor ($timeout, $translate, CloudMessage, VpsService) {
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.VpsService = VpsService;
    }

    getTasks (serviceName) {
        this.VpsService.getTaskInProgress(serviceName)
            .then(tasks => this.handleTasks(serviceName, tasks))
            .catch(err => this.CloudMessage(err));
    }

    handleTasks (serviceName, tasks) {
        _.forEach(tasks, task => {
            this.manageMessage(task);
        });
        // refresh while there's task in progress
        this.$timeout(() => {
            if (!_.isEmpty(tasks)) {
                this.getTasks(serviceName);
            } else {
                this.flushMessages();
            }

        }, 5000);
    }

    manageMessage (task) {
        // _.forEach(this.CloudMessage.getMessages(), message => {
        //     if (message.ref == "task" && message.id == task.id) {
        //         message.dismissed = true;
        //     }
        // });
        this.createMessage(task);
    }

    createMessage (task) {
        this.CloudMessage.warning({
            id: task.id,
            ref: "task",
            textHtml: this.template(task.type, task.progress)
        }, "iaas.vps.detail");
    }

    flushMessages () {
        _.forEach(this.CloudMessage.getMessages("iaas.vps.detail"), message => {
            if (message.ref == "task") {
                message.dismissed = true;
            }
        });
        this.CloudMessage.success(this.$translate.instant("vps_dashboard_task_finish"));
    }

    template (type, progress) {
        return `
            <p>${this.messageType(type)}</p>
            <div class="oui-progress oui-progress_info">
                <div class="oui-progress__bar oui-progress__bar_info" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
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
