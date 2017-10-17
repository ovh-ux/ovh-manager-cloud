class CloudDbImageService {
    constructor ($filter, $q, $translate, ControllerHelper, OvhApiCloudDb, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    getImage (projectId, imageId) {
        return this.OvhApiCloudDb.Lexi().getImage({ projectId, imageId })
            .$promise
            .then(response => {
                response.displayName = response.name;
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_image_loading_error"));
    }

    getImages (projectId) {
        return this.OvhApiCloudDb.Lexi().getImages({ projectId })
            .$promise
            .then(response => {
                const promises = _.map(response, imageId => this.getImage(projectId, imageId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_instance_image_list_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbImageService", CloudDbImageService);
