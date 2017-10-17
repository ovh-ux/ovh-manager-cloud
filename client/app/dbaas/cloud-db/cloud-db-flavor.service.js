class CloudDbFlavorService {
    constructor ($filter, $q, $translate, ControllerHelper, OvhApiCloudDb, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    getFlavor (projectId, flavorId) {
        return this.OvhApiCloudDb.Lexi().getFlavor({ projectId, flavorId })
            .$promise
            .then(response => {
                response.displayName = response.name;
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_flavor_loading_error"));
    }

    getFlavors (projectId) {
        return this.OvhApiCloudDb.Lexi().getFlavors({ projectId })
            .$promise
            .then(response => {
                const promises = _.map(response, flavorId => this.getFlavor(projectId, flavorId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_flavor_list_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbFlavorService", CloudDbFlavorService);
