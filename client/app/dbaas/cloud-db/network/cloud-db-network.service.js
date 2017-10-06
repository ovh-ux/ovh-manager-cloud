class CloudDbNetworkService {
    constructor ($q, CloudDbTaskService, OvhApiCloudDb, ServiceHelper) {
        this.$q = $q;
        this.CloudDbTaskService = CloudDbTaskService;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    addNetwork (projectId, instanceId, data) {
        return this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().post({ projectId, instanceId }, data)
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_network_add_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_network_add_error"));
    }

    saveNetwork (projectId, instanceId, networkId, data) {
        return this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().edit({ projectId, instanceId, networkId }, data)
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_network_update_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_network_update_error"));
    }

    deleteNetwork (projectId, instanceId, networkId) {
        return this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().remove({ projectId, instanceId, networkId })
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_network_delete_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_network_delete_error"));
    }

    getNetwork (projectId, instanceId, networkId, config = {}) {
        if (config.resetCache) {
            this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().resetCache();
        }

        return this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().get({ projectId, instanceId, networkId })
            .$promise
            .then(response => {
                if (response.taskId) {
                    response.task = { id: response.taskId };
                    return this.CloudDbTaskService.getTask(projectId, response.taskId)
                        .then(task => {
                            response.task = task;
                            return response;
                        });
                }

                response.task = { progress: 0 };
                return response;
            })
            .catch(error => {
                if (!config.muteError) {
                    return this.ServiceHelper.errorHandler("cloud_db_network_loading_error")(error);
                }

                return this.$q.reject(error);
            });
    }

    getNetworks (projectId, instanceId) {
        return this.OvhApiCloudDb.StandardInstance().WhiteList().Lexi().query({ projectId, instanceId })
            .$promise
            .then(response => {
                const promises = _.map(response, networkId => this.getNetwork(projectId, instanceId, networkId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_network_list_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbNetworkService", CloudDbNetworkService);
