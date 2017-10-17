class CloudDbGrantService {
    constructor ($filter, $translate, ControllerHelper, OvhApiCloudDb) {
        this.$filter = $filter;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
    }

    getGrantTypes () {
        return this.OvhApiCloudDb.Lexi().schema()
            .$promise
            .then(response => _.map(response.models["cloudDB.standard.grant.Type"].enum, grantType => ({ text: grantType, value: grantType })));
    }
}

angular.module("managerApp").service("CloudDbGrantService", CloudDbGrantService);
