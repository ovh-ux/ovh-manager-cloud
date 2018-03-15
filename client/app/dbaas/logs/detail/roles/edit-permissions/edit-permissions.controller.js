class LogsRolesPermissionsCtrl {
    constructor ($q, $stateParams, CloudMessage, ControllerHelper, LogsRolesService) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.roleId = this.$stateParams.roleId;
        this.ControllerHelper = ControllerHelper;
        this.LogsRolesService = LogsRolesService;
        this.CloudMessage = CloudMessage;
        this.initLoaders();
    }

    initLoaders () {
        this.availableStreams = this.$q.defer();
        this.attachedStreams = this.$q.defer();
        this.availableIndices = this.$q.defer();
        this.attachedIndices = this.$q.defer();
        this.availableDashboards = this.$q.defer();
        this.attachedDashboards = this.$q.defer();
        this.availableAliases = this.$q.defer();
        this.attachedAliases = this.$q.defer();

        this.roleDetails = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getRoleDetails(this.serviceName, this.roleId)
                .then(role => {
                    this.loadAttachedPermissions(role.permissions);
                    this.loadAvailableAliases(role.permissions);
                    this.loadAvailableDashboards(role.permissions);
                    this.loadAvailableIndices(role.permissions);
                    this.loadAvailableStreams(role.permissions);
                    return role;
                })
        });
        this.roleDetails.load();
    }

    loadAvailableAliases (permissionList) {
        this.allAliases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllAliases(this.serviceName)
                .then(result => {
                    const diff = _.map(_.filter(result, alias => alias.info.isEditable && !_.find(permissionList, permission => permission.aliasId === alias.info.aliasId)), "info");
                    this.availableAliases.resolve(diff);
                })
        });
        this.allAliases.load();
    }

    loadAvailableIndices (permissionList) {
        this.allIndices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllIndices(this.serviceName)
                .then(result => {
                    const diff = _.map(_.filter(result, index => index.info.isEditable && !_.find(permissionList, permission => permission.indexId === index.info.indexId)), "info");
                    this.availableIndices.resolve(diff);
                })
        });
        this.allIndices.load();
    }

    loadAvailableDashboards (permissionList) {
        this.allDashboards = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllDashboards(this.serviceName)
                .then(result => {
                    const diff = _.map(_.filter(result, dashboard => dashboard.info.isEditable && !_.find(permissionList, permission => permission.dashboardId === dashboard.info.dashboardId)), "info");
                    this.availableDashboards.resolve(diff);
                })
        });
        this.allDashboards.load();
    }

    loadAvailableStreams (permissionList) {
        this.allStreams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllStreams(this.serviceName)
                .then(result => {
                    const diff = _.map(_.filter(result, stream => !_.find(permissionList, permission => permission.streamId === stream.info.streamId)), "info");
                    this.availableStreams.resolve(diff);
                })
        });
        this.allStreams.load();
    }

    /**
     * initializes and loads list of permissions
     * adding permissionId to the object of index, alias, dashboard and stream so as to use it to remove permission later
     * @memberof LogsRolesPermissionsCtrl
     */
    loadAttachedPermissions (permissionList) {
        this.permissions = this.LogsRolesService.getNewPermissions();
        permissionList.forEach(permission => {
            if (permission.index) { _.extend(permission.index, { permissionId: permission.permissionId }); this.permissions.index.push(permission.index); }
            if (permission.alias) { _.extend(permission.alias, { permissionId: permission.permissionId }); this.permissions.alias.push(permission.alias); }
            if (permission.stream) { _.extend(permission.stream, { permissionId: permission.permissionId }); this.permissions.stream.push(permission.stream); }
            if (permission.dashboard) { _.extend(permission.dashboard, { permissionId: permission.permissionId }); this.permissions.dashboard.push(permission.dashboard); }
        });
        this.attachedIndices.resolve(this.permissions.index);
        this.attachedAliases.resolve(this.permissions.alias);
        this.attachedDashboards.resolve(this.permissions.dashboard);
        this.attachedStreams.resolve(this.permissions.stream);
    }

    attachAlias (item) {
        this.CloudMessage.flushChildMessage();
        this.saveAlias = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addAlias(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveAlias.load();
    }

    attachIndex (item) {
        this.CloudMessage.flushChildMessage();
        this.saveIndex = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addIndex(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveIndex.load();
    }

    attachStream (item) {
        this.CloudMessage.flushChildMessage();
        this.saveStream = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addStream(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveStream.load();
    }

    attachDashboard (item) {
        this.CloudMessage.flushChildMessage();
        this.saveDashboard = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addDashboard(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveDashboard.load();
    }

    removePermission (permission) {
        this.CloudMessage.flushChildMessage();
        this.deletePermission = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.removePermission(this.serviceName, this.roleId, permission),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.deletePermission.load();
    }
}

angular.module("managerApp").controller("LogsRolesPermissionsCtrl", LogsRolesPermissionsCtrl);
