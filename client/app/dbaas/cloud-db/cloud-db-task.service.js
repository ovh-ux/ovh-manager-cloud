class CloudDbTaskService {
    constructor ($filter, $q, $translate, ControllerHelper, OvhApiCloudDb, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    getTask (projectId, taskId, config = {}) {
        return this.OvhApiCloudDb.Lexi().getTask({ projectId, taskId })
            .$promise
            .catch(error => {
                if (!config.muteError) {
                    return this.ServiceHelper.errorHandler("cloud_db_instance_task_loading_error")(error);
                }

                return this.$q.reject(error);
            });
    }

    getTasks (projectId, config = {}) {
        return this.OvhApiCloudDb.Lexi().getTasks({ projectId })
            .$promise
            .then(response => {
                const promises = _.map(response, taskId => this.getTask(projectId, taskId, config));
                return this.$q.all(promises);
            })
            .catch(error => {
                if (!config.muteError) {
                    return this.ServiceHelper.errorHandler("cloud_db_instance_task_list_loading_error")(error);
                }

                return this.$q.reject(error);
            });
    }
}

angular.module("managerApp").service("CloudDbTaskService", CloudDbTaskService);
