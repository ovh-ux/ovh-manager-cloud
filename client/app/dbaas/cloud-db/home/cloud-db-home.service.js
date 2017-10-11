class CloudDbHomeService {
    constructor ($q, CloudDbAdvancedParameterService, CloudDbInstanceService, OvhApiCloudDb, OvhApiCloudDbStdInstance, ServiceHelper, SidebarMenu) {
        this.$q = $q;
        this.CloudDbAdvancedParameterService = CloudDbAdvancedParameterService;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.OvhApiCloudDbStdInstance = OvhApiCloudDbStdInstance;
        this.ServiceHelper = ServiceHelper;
        this.SidebarMenu = SidebarMenu;
    }

    getStatus (projectId, instanceId) {
        return this.CloudDbInstanceService.getInstance(projectId, instanceId)
            .then(response => ({
                status: response.status,
                ram: response.flavor.ram,
                diskUsage: response.diskUsage,
                diskOverquota: response.diskOverquota
            }))
            .catch(this.ServiceHelper.errorHandler("cloud_db_home_status_loading_error"));
    }

    getAccess (projectId, instanceId) {
        return this.CloudDbInstanceService.getInstance(projectId, instanceId)
            .then(response => ({
                hostName: response.endpoint,
                port: response.port,
                command: response.accessCommand
            }))
            .catch(this.ServiceHelper.errorHandler("cloud_db_home_access_loading_error"));
    }

    getConfiguration (projectId, instanceId) {
        const promisesHash = {
            configuration: this.CloudDbInstanceService.getInstance(projectId, instanceId),
            parameters: this.CloudDbAdvancedParameterService.getCurrentParameters(projectId, instanceId)
        };

        return this.$q.all(promisesHash)
            .then(response => ({
                displayName: response.configuration.name || response.configuration.id,
                offer: response.configuration.flavor,
                type: response.configuration.image,
                advancedParameters: response.parameters,
                region: "GRA1" // Replace by response.region.name once it's not mocked anymore.
            }))
            .catch(this.ServiceHelper.errorHandler("cloud_db_home_configuration_loading_error"));
    }

    updateName (projectId, instanceId, newName) {
        return this.OvhApiCloudDbStdInstance.Lexi().edit({ projectId, instanceId }, { name: newName })
            .$promise
            .catch(this.ServiceHelper.errorHandler("cloud_db_name_change_error"));
    }
}

angular.module("managerApp").service("CloudDbHomeService", CloudDbHomeService);
