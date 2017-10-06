class CloudDbProjectService {
    constructor ($q, $rootScope, CloudDbInstanceService, OvhApiCloudDb, ServiceHelper, SidebarMenu) {
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
        this.SidebarMenu = SidebarMenu;
    }

    getConfiguration (projectId) {
        return this.OvhApiCloudDb.Lexi().get({ projectId })
            .$promise
            .then(response => {
                response.displayName = response.name || projectId;

                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_configuration_loading_error"));
    }

    getSubscription (projectId) {
        return this.OvhApiCloudDb.Lexi().getServiceInfos({ projectId })
            .$promise
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_subscription_loading_error"));
    }

    updateName (projectId, newName) {
        return this.OvhApiCloudDb.Lexi().edit({ projectId }, { name: newName })
            .$promise
            .then(response => {
                this.getConfiguration(projectId).then(configuration => this.changeMenuTitle(projectId, configuration.displayName || projectId));
                this.$rootScope.$broadcast("cloudDb.project.nameChange");
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_change_error"));
    }

    changeMenuTitle (projectId, displayName) {
        const menuItem = this.SidebarMenu.getItemById(projectId);
        if (menuItem) {
            menuItem.title = displayName;
        }
    }
}

angular.module("managerApp").service("CloudDbProjectService", CloudDbProjectService);
