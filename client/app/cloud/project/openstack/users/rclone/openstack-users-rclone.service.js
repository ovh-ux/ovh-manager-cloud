class CloudProjectOpenstackUsersRcloneService {
    constructor ($q, OvhApiCloud, RegionService, ServiceHelper) {
        this.$q = $q;
        this.OvhApiCloud = OvhApiCloud;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getValidRcloneRegions (projectId) {
        return this.OvhApiCloud.Project().Region().Lexi().query({ serviceName: projectId })
            .$promise
            .then(regions => _.map(regions, region => this.RegionService.getRegion(region)))
            .catch(this.ServiceHelper.errorHandler("cpou_rclone_modal_loading_error"));
    }
}

angular.module("managerApp").service("CloudProjectOpenstackUsersRcloneService", CloudProjectOpenstackUsersRcloneService);