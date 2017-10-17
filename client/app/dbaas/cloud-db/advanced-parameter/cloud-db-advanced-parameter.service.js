class CloudDbAdvancedParameterService {
    constructor ($q, CloudDbProjectService, OvhApiCloudDb, ServiceHelper) {
        this.$q = $q;
        this.CloudDbProjectService = CloudDbProjectService;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    getCurrentParameters (projectId, instanceId) {
        return this.OvhApiCloudDb.StandardInstance().Lexi().getConfiguration({ projectId, instanceId })
            .$promise
            .then(response => {
                response.isDefaultConfiguration = () => !_.some(response.details, detail => detail.value !== detail.defaultValue);
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_advanced_parameter_loading_error"));
    }

    updateCurrentParameters (projectId, instanceId, data) {
        return this.OvhApiCloudDb.StandardInstance().Lexi().updateConfiguration({ projectId, instanceId }, data)
            .$promise
            .catch(this.ServiceHelper.successHandler("cloud_db_advanced_parameter_update_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_advanced_parameter_update_error"));
    }
}

angular.module("managerApp").service("CloudDbAdvancedParameterService", CloudDbAdvancedParameterService);
