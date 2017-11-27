class CloudProjectOpenstackUsersRcloneService {
    constructor ($httpParamSerializer, $q, CONFIG_API, OvhApiCloud, RegionService, ServiceHelper) {
        this.$httpParamSerializer = $httpParamSerializer;
        this.$q = $q;
        this.CONFIG_API = CONFIG_API;
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

    getRcloneFileInfo (projectId, userId, region) {
        let url = [
            (_.find(this.CONFIG_API.apis, { serviceType: "apiv6" }) || {}).urlPrefix,
            this.OvhApiCloud.Project().User().Lexi().services.rclone.url,
            "?",
            this.$httpParamSerializer({
                region
            })
        ].join("");

        const replacements = {
            serviceName: projectId,
            userId
        };

        Object.keys(replacements).forEach(paramName => {
            url = url.replace(`:${paramName}`, replacements[paramName]);
        });

        return this.$q.when({
            url
        });
    }
}

angular.module("managerApp").service("CloudProjectOpenstackUsersRcloneService", CloudProjectOpenstackUsersRcloneService);