class LogsRolesService {
    constructor ($q, $translate, CloudPoll, ControllerHelper, LogsAliasesService, LogsDashboardService, LogsIndexService, LogsOptionsService, LogsRolesConstant, LogsStreamsService, OvhApiDbaas, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.ServiceHelper = ServiceHelper;
        this.ControllerHelper = ControllerHelper;
        this.LogsDashboardService = LogsDashboardService;
        this.LogsOptionsService = LogsOptionsService;
        this.LogsAliasesService = LogsAliasesService;
        this.LogsDashboardService = LogsDashboardService;
        this.LogsIndexService = LogsIndexService;
        this.LogsStreamsService = LogsStreamsService;

        this.LogsRolesConstant = LogsRolesConstant;
        this.CloudPoll = CloudPoll;
        this.LogsApiService = OvhApiDbaas.Logs().Lexi();
        this.MembersApiService = OvhApiDbaas.Logs().Role().Member().Lexi();
        this.PermissionsApiService = OvhApiDbaas.Logs().Role().Permission().Lexi();

        this.OperationApiService = OvhApiDbaas.Logs().Operation().Lexi();
        this.RolesApiService = OvhApiDbaas.Logs().Role().Lexi();
        this.RolesAapiService = OvhApiDbaas.Logs().Role().Aapi();
        this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();

        this.newRole = {
            description: "",
            name: "",
            optionId: null
        };
    }

    getAllStreams (serviceName) {
        return this.LogsStreamsService.getStreamDetails(serviceName);
    }

    getAllAliases (serviceName) {
        return this.LogsAliasesService.getAliases(serviceName);
    }

    getAllDashboards (serviceName) {
        return this.LogsDashboardService.getDashboards(serviceName);
    }

    getAllIndices (serviceName) {
        return this.LogsIndexService.getIndices(serviceName);
    }

    addAlias (serviceName, roleId, aliasId) {
        return this.PermissionsApiService.addAlias({ serviceName, roleId }, { aliasId }).$promise;
    }

    addDashboard (serviceName, roleId, dashboardId) {
        return this.PermissionsApiService.addDashboard({ serviceName, roleId }, { dashboardId }).$promise;
    }

    addIndex (serviceName, roleId, indexId) {
        return this.PermissionsApiService.addIndex({ serviceName, roleId }, { indexId }).$promise;
    }

    addStream (serviceName, roleId, streamId) {
        return this.PermissionsApiService.addStream({ serviceName, roleId }, { streamId }).$promise;
    }

    removePermission (serviceName, roleId, permissionId) {
        return this.PermissionsApiService.remove({ serviceName, roleId, permissionId }).$promise;
    }

    getNewRole () {
        return this.newRole;
    }

    getLogs () {
        return this.LogsApiService.query().$promise
            .then(logs => {
                const promises = logs.map(serviceName => this.getLogDetails(serviceName));
                return this.$q.all(promises);
            }).catch(this.ServiceHelper.errorHandler("logs_get_error"));
    }

    getLogDetails (serviceName) {
        return this.LogsApiService.logDetail({ serviceName }).$promise;
    }

    getQuota (serviceName) {
        return this.AccountingAapiService.me({ serviceName }).$promise
            .then(me => {
                const quota = {
                    max: me.total.maxNbRole,
                    mainOfferMax: me.offer.maxNbRole,
                    mainOfferCurrent: me.offer.curNbRole,
                    configured: me.total.curNbRole,
                    currentUsage: me.total.curNbRole * 100 / me.total.maxNbRole
                };
                return quota;
            }).catch(this.ServiceHelper.errorHandler("logs_roles_quota_get_error"));
    }

    getRoles (serviceName) {
        return this.RolesApiService.query({ serviceName }).$promise
            .then(roles => {
                const promises = roles.map(roleId => this.getRoleDetails(serviceName, roleId));
                return this.$q.all(promises);
            }).catch(this.ServiceHelper.errorHandler("logs_roles_get_error"));
    }

    getRoleDetails (serviceName, roleId) {
        return this.RolesAapiService.get({ serviceName, roleId }).$promise;
    }

    getSubscribedOptions (serviceName) {
        return this.LogsOptionsService.getSubscribedOptionsByType(serviceName, this.LogsRolesConstant.optionType);
    }

    addRole (serviceName, object) {
        return this.RolesApiService.create({ serviceName }, object).$promise
            .then(operation => this._handleSuccess(serviceName, operation.data, "logs_role_add_success", object.name))
            .catch(this.ServiceHelper.errorHandler("logs_role_add_error"));
    }

    updateRole (serviceName, roleId, object) {
        return this.RolesApiService.update({ serviceName, roleId }, object).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_role_update_success", object.name);
            })
            .catch(this.ServiceHelper.errorHandler("logs_role_update_error"));
    }

    deleteRole (serviceName, role) {
        return this.RolesApiService.remove({ serviceName, roleId: role.roleId }).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_role_delete_success", role.name);
            })
            .catch(this.ServiceHelper.errorHandler("logs_role_delete_error"));
    }

    deleteModal (role) {
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_role_modal_delete_title"),
            text: this.$translate.instant("logs_role_modal_delete_question", { name: role.name })
        });
    }

    createMember (serviceName, roleId, userDetails) {
        return this.MembersApiService.create({ serviceName, roleId }, userDetails).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_role_member_add_success", userDetails.username);
            })
            .catch(this.ServiceHelper.errorHandler("logs_role_member_add_error"));
    }

    removeMember (serviceName, roleId, username) {
        return this.MembersApiService.remove({ serviceName, roleId, username }).$promise
            .then(operation => {
                this._resetAllCache();
                return this._handleSuccess(serviceName, operation.data, "logs_role_member_remove_success", username);
            })
            .catch(this.ServiceHelper.errorHandler("logs_role_member_remove_error"));
    }

    deleteMemberModal (username) {
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_member_delete_title"),
            text: this.$translate.instant("logs_member_delete_question", { username })
        });
    }

    _handleSuccess (serviceName, operation, successMessage, name) {
        this.poller = this._pollOperation(serviceName, operation);
        return this.poller.$promise
            .then(() => this.ServiceHelper.successHandler(successMessage)({ name }));
    }

    _killPoller () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    _pollOperation (serviceName, operation) {
        this._killPoller();
        return this.CloudPoll.poll({
            item: operation,
            pollFunction: opn => this.OperationApiService.get({ serviceName, operationId: opn.operationId }).$promise,
            stopCondition: opn => opn.state === this.LogsRolesConstant.SUCCESS || opn.state === this.LogsRolesConstant.FAILURE
        });
    }

    _resetAllCache () {
        this.RolesApiService.resetAllCache();
        this.RolesAapiService.resetAllCache();
        this.MembersApiService.resetAllCache();
        this.AccountingAapiService.resetAllCache();
    }
}

angular.module("managerApp").service("LogsRolesService", LogsRolesService);
