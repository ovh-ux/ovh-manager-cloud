class LogsRolesPermissionsCtrl {
    constructor ($q, $stateParams, ControllerHelper, CloudMessage, LogsRolesService) {
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
                    this.permissions = this.LogsRolesService.getNewPermissions();
                    role.permissions.forEach(permission => {
                        if (permission.index) { _.extend(permission.index, { permissionId: permission.permissionId }); this.permissions.index.push(permission.index); }
                        if (permission.alias) { _.extend(permission.alias, { permissionId: permission.permissionId }); this.permissions.alias.push(permission.alias); }
                        if (permission.stream) { _.extend(permission.stream, { permissionId: permission.permissionId }); this.permissions.stream.push(permission.stream); }
                        if (permission.dashboard) { _.extend(permission.dashboard, { permissionId: permission.permissionId }); this.permissions.dashboard.push(permission.dashboard); }
                    });
                    this.attachedIndices.resolve(this.permissions.index);
                    this.attachedAliases.resolve(this.permissions.alias);
                    this.attachedDashboards.resolve(this.permissions.dashboard);
                    this.attachedStreams.resolve(this.permissions.stream);
                    return role;
                })
        });

        this.allIndices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllIndices(this.serviceName)
        });
        this.allDashboards = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllDashboards(this.serviceName)
        });
        this.allAliases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllAliases(this.serviceName)
        });
        this.allStreams = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.getAllStreams(this.serviceName)
        });
        this.roleDetails.load();
        this.allIndices.load();
        this.allDashboards.load();
        this.allStreams.load();
        this.allAliases.load();

        this.$q.all([this.allIndices.promise, this.roleDetails.promise])
            .then(result => {
                const diff = _.map(_.filter(result[0], index => index.info.isEditable && !_.find(result[1].permissions, permission => permission.indexId === index.info.indexId)), "info");
                this.availableIndices.resolve(diff);
            });

        this.$q.all([this.allStreams.promise, this.roleDetails.promise])
            .then(result => {
                const diff = _.map(_.filter(result[0], stream => stream.info.isEditable && !_.find(result[1].permissions, permission => permission.streamId === stream.info.streamId)), "info");
                this.availableStreams.resolve(diff);
            });

        this.$q.all([this.allDashboards.promise, this.roleDetails.promise])
            .then(result => {
                const diff = _.map(_.filter(result[0], dashboard => dashboard.info.isEditable && !_.find(result[1].permissions, permission => permission.dashboardId === dashboard.info.dashboardId)), "info");
                this.availableDashboards.resolve(diff);
            });

        this.$q.all([this.allAliases.promise, this.roleDetails.promise])
            .then(result => {
                const diff = _.map(_.filter(result[0], alias => alias.info.isEditable && !_.find(result[1].permissions, permission => permission.aliasId === alias.info.aliasId)), "info");
                this.availableAliases.resolve(diff);
            });
    }

    attachAlias (item) {
        this.saveAlias = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addAlias(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveAlias.load();
    }

    attachIndex (item) {
        this.saveIndex = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addIndex(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()            
        });
        return this.saveIndex.load();
    }

    attachStream (item) {
        this.saveStream = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addStream(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveStream.load();
    }

    attachDashboard (item) {
        this.saveDashboard = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.addDashboard(this.serviceName, this.roleId, item[0]),
            successHandler: () => this.roleDetails.load(),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.saveDashboard.load();
    }

    removePermission (permission) {
        this.deletePermission = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsRolesService.removePermission(this.serviceName, this.roleId, permission),
            errorHandler: () => this.ControllerHelper.scrollPageToTop()
        });
        return this.deletePermission.load();
    }
}

angular.module("managerApp").controller("LogsRolesPermissionsCtrl", LogsRolesPermissionsCtrl);
