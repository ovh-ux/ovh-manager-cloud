class OvhTaskAlertsService {
    constructor ($translate, ControllerHelper, CloudMessage, OvhApiMeAlertsAapi, $http, TranslateService) {
        this.$translate = $translate;
        this.$http = $http;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.UserAlertsAapi = OvhApiMeAlertsAapi;
        this.TranslateService = TranslateService;
    }

    getTaskInfo () {
        return this.$http.get("/ovh-tasks", {
            serviceType: "aapi"
        }).then(response => {
            if (response.data.alerts.length) {
                _.forEach(response.data.alerts, alert => {
                    const tasks = _.map(_.get(response, "data.tasks", []), task => {
                        task.comments = _.map(task.comments, comment => {
                            comment.comment_text = _.get(comment, "comment_text", "").replace(/\\'/g, "'").replace(/\\"/g, "\"");
                            return comment;
                        }).reverse();
                        task.detailed_desc = _.get(task, "detailed_desc", "").replace(/\\'/g, "'").replace(/\\"/g, "\"");
                        return task;
                    });
                    this.sendAlert(alert, tasks);
                });
                return response.data;
            }
            return {};
        });
    }

    sendAlert (alert, tasks) {
        const language = this.TranslateService.getGeneralLanguage();
        const locale = language === "en" ? "en_GB" : "fr_FR";
        const text = alert[locale];
        const message = {
            textHtml: text
        };
        if (tasks.length) {
            message.link = {
                type: "action",
                action: () => this.showSubTasks(tasks),
                text: this.$translate.instant("ovh_task_follow_button")
            };
        }
        return this.CloudMessage.warning(message, "index");
    }

    getOvhTaskAlerts () {
        return this.$translate.refresh().then(() => {
            return this.getTaskInfo();
        });
    }

    showSubTasks (tasks) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "components/ovh-task-alert/modal/ovh-task-follow-modal.html",
                controller: "ovhTaskFollowModalCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    tasks: () => tasks
                }
            }
        });
    };
}

angular.module("managerApp").service("OvhTaskAlertsService", OvhTaskAlertsService);
