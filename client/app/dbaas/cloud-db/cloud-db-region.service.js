class CloudDbRegionService {
    constructor ($filter, $q, $translate, ControllerHelper, OvhApiCloudDb, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    getRegion (projectId, regionId) {
        return this.OvhApiCloudDb.Lexi().getRegion({ projectId, regionId })
            .$promise
            .then(response => {
                response.displayName = response.name;
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_region_loading_error"));
    }

    getRegions (projectId) {
        return this.OvhApiCloudDb.Lexi().getRegions({ projectId })
            .$promise
            .then(response => {
                const promises = _.map(response, regionId => this.getRegion(projectId, regionId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_region_list_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbRegionService", CloudDbRegionService);
