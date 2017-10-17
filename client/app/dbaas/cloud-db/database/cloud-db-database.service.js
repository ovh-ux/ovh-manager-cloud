class CloudDbDatabaseService {
    constructor ($filter, $q, OvhApiCloudDbStdInstanceDatabase, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.OvhApiCloudDbStdInstanceDatabase = OvhApiCloudDbStdInstanceDatabase;
        this.ServiceHelper = ServiceHelper;
    }

    addDatabase (projectId, instanceId, data) {
        const postData = _.omit(data, "users");
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().post({ projectId, instanceId }, postData)
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_database_add_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_database_add_error"));
    }

    saveDatabase (projectId, instanceId, databaseId, data) {
        return this.ServiceHelper.errorHandler("cloud_db_database_update_error")({});
    }

    deleteDatabase (projectId, instanceId, databaseId) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().delete({ projectId, instanceId, databaseId })
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_database_delete_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_database_delete_error"));
    }

    getDatabase (projectId, instanceId, databaseId, config = {}) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().get({ projectId, instanceId, databaseId })
            .$promise
            .then(response => {
                response.displayName = response.name;
                response.status = {
                    value: response.status,
                    text: response.status
                };

                response.quotaUsed.text = this.$filter("bytes")(response.quotaUsed.value, 0, false, response.quotaUsed.unit);
                return response;
            })
            .catch(error => {
                if (!config.muteError) {
                    return this.ServiceHelper.errorHandler("cloud_db_database_loading_error")(error);
                }

                return this.$q.reject(error);
            });
    }

    getDatabases (projectId, instanceId) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().query({ projectId, instanceId })
            .$promise
            .then(response => {
                const promises = _.map(response, dataBaseId => this.getDatabase(projectId, instanceId, dataBaseId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_database_list_loading_error"));
    }

    getAvailableExtension (projectId, instanceId, databaseId, extensionId) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().getExtension({ projectId, instanceId, databaseId, extensionId }).$promise;
    }

    getAvailableExtensions (projectId, instanceId, databaseId) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().getExtensions({ projectId, instanceId, databaseId })
            .$promise
            .then(response => {
                const promises = _.map(response, extensionId => this.getAvailableExtension(projectId, instanceId, databaseId, extensionId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_database_extension_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbDatabaseService", CloudDbDatabaseService);
