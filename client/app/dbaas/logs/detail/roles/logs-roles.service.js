class LogsRolesService {
  constructor($q, $translate, CucCloudPoll, CucControllerHelper, LogsAliasesService,
    LogsDashboardsService, LogsHelperService, LogsIndexService, LogsOptionsService,
    LogsConstants, LogsStreamsService, OvhApiDbaas, CucServiceHelper) {
    this.$q = $q;
    this.$translate = $translate;
    this.CucServiceHelper = CucServiceHelper;
    this.CucControllerHelper = CucControllerHelper;
    this.LogsDashboardsService = LogsDashboardsService;
    this.LogsOptionsService = LogsOptionsService;
    this.LogsAliasesService = LogsAliasesService;
    this.LogsIndexService = LogsIndexService;
    this.LogsStreamsService = LogsStreamsService;
    this.LogsHelperService = LogsHelperService;

    this.LogsConstants = LogsConstants;
    this.CucCloudPoll = CucCloudPoll;
    this.LogsApiService = OvhApiDbaas.Logs().v6();
    this.MembersApiService = OvhApiDbaas.Logs().Role().Member().v6();
    this.PermissionsApiService = OvhApiDbaas.Logs().Role().Permission().v6();

    this.OperationApiService = OvhApiDbaas.Logs().Operation().v6();
    this.RolesApiService = OvhApiDbaas.Logs().Role().v6();
    this.RolesAapiService = OvhApiDbaas.Logs().Role().Aapi();
    this.AccountingAapiService = OvhApiDbaas.Logs().Accounting().Aapi();

    this.newRole = {
      description: '',
      name: '',
      optionId: null,
    };
    this.permissions = {
      dashboard: [],
      alias: [],
      index: [],
      stream: [],
    };
  }

  getNewPermissions() {
    this.permissions.dashboard.length = 0;
    this.permissions.alias.length = 0;
    this.permissions.index.length = 0;
    this.permissions.stream.length = 0;
    return this.permissions;
  }

  getAllStreams(serviceName) {
    return this.LogsStreamsService.getShareableStreams(serviceName);
  }

  getAllAliases(serviceName) {
    return this.LogsAliasesService.getShareableAliases(serviceName);
  }

  getAllDashboards(serviceName) {
    return this.LogsDashboardsService.getShareableDashboards(serviceName);
  }

  getAllIndices(serviceName) {
    return this.LogsIndexService.getShareableIndices(serviceName);
  }

  addAlias(serviceName, roleId, alias) {
    return this.PermissionsApiService
      .addAlias({ serviceName, roleId, aliasId: alias.aliasId }).$promise
      .then((operation) => {
        this.RolesAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_roles_add_alias_error', err, { tokenName: alias.name }));
  }

  addDashboard(serviceName, roleId, dashboard) {
    return this.PermissionsApiService
      .addDashboard({ serviceName, roleId, dashboardId: dashboard.dashboardId }).$promise
      .then((operation) => {
        this.RolesAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_roles_add_dashboard_error', err, { tokenName: dashboard.title }));
  }

  addIndex(serviceName, roleId, index) {
    return this.PermissionsApiService
      .addIndex({ serviceName, roleId, indexId: index.indexId }).$promise
      .then((operation) => {
        this.RolesAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_roles_add_index_error', err, { tokenName: index.name }));
  }

  addStream(serviceName, roleId, stream) {
    return this.PermissionsApiService
      .addStream({ serviceName, roleId, streamId: stream.streamId }).$promise
      .then((operation) => {
        this.RolesAapiService.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation);
      })
      .catch(err => this.LogsHelperService.handleError('logs_roles_add_stream_error', err, { tokenName: stream.title }));
  }

  removePermission(serviceName, roleId, permission) {
    return this.PermissionsApiService
      .remove({ serviceName, roleId }, { permissionId: permission[0].permissionId }).$promise
      .then(operation => this.LogsHelperService.handleOperation(
        serviceName,
        operation.data || operation,
      ))
      .catch(err => this.LogsHelperService.handleError('logs_remove_permission_error', err, { tokenName: permission[0].name || permission[0].title }));
  }

  getNewRole() {
    return this.newRole;
  }

  getLogs() {
    return this.LogsApiService.query().$promise
      .then((logs) => {
        const promises = logs.map(serviceName => this.getLogDetails(serviceName));
        return this.$q.all(promises);
      })
      .catch(this.CucServiceHelper.errorHandler('logs_get_error'));
  }

  getLogDetails(serviceName) {
    return this.LogsApiService.logDetail({ serviceName }).$promise;
  }

  getQuota(serviceName) {
    return this.AccountingAapiService.me({ serviceName }).$promise
      .then((me) => {
        const quota = {
          max: me.total.maxNbRole,
          mainOfferMax: me.offer.maxNbRole,
          mainOfferCurrent: me.offer.curNbRole,
          configured: me.total.curNbRole,
          currentUsage: me.total.curNbRole * 100 / me.total.maxNbRole,
        };
        return quota;
      }).catch(err => this.LogsHelperService.handleError('logs_roles_quota_get_error', err, {}));
  }

  getRoles(serviceName) {
    return this.RolesApiService.query({ serviceName }).$promise
      .then((roles) => {
        const promises = roles.map(roleId => this.getRoleDetails(serviceName, roleId));
        return this.$q.all(promises);
      }).catch(err => this.LogsHelperService.handleError('logs_roles_get_error', err, {}));
  }

  getRoleDetails(serviceName, roleId) {
    return this.RolesAapiService.get({ serviceName, roleId }).$promise;
  }

  getSubscribedOptions(serviceName) {
    return this.LogsOptionsService.getSubscribedOptionsByType(
      serviceName,
      this.LogsConstants.ROLE_OPTION_REFERENCE,
    );
  }

  addRole(serviceName, object) {
    return this.RolesApiService.create({ serviceName }, object).$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_role_add_success', { name: object.name });
      })
      .catch(err => this.LogsHelperService.handleError('logs_role_add_error', err, { name: object.name }));
  }

  updateRole(serviceName, roleId, object) {
    return this.RolesApiService.update({ serviceName, roleId }, object).$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_role_update_success', { name: object.name });
      })
      .catch(err => this.LogsHelperService.handleError('logs_role_update_error', err, { name: object.name }));
  }

  deleteRole(serviceName, role) {
    return this.RolesApiService.remove({ serviceName, roleId: role.roleId }).$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_role_delete_success', { name: role.name });
      })
      .catch(err => this.LogsHelperService.handleError('logs_role_delete_error', err, { name: role.name }));
  }

  deleteModal(role) {
    return this.CucControllerHelper.modal.showDeleteModal({
      titleText: this.$translate.instant('logs_role_modal_delete_title'),
      textHtml: this.$translate.instant('logs_role_modal_delete_question', { name: role.name }),
    });
  }

  createMember(serviceName, roleId, userDetails) {
    return this.MembersApiService.create({ serviceName, roleId }, userDetails).$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_role_member_add_success', { name: userDetails.username });
      })
      .catch(err => this.LogsHelperService.handleError('logs_role_member_add_error', err, { name: userDetails.username }));
  }

  removeMember(serviceName, roleId, username) {
    return this.MembersApiService.remove({ serviceName, roleId, username }).$promise
      .then((operation) => {
        this.resetAllCache();
        return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, 'logs_role_member_remove_success', { name: username });
      })
      .catch(err => this.LogsHelperService.handleError('logs_role_member_remove_error', err, { name: username }));
  }

  deleteMemberModal(username) {
    return this.CucControllerHelper.modal.showDeleteModal({
      titleText: this.$translate.instant('logs_member_delete_title'),
      textHtml: this.$translate.instant('logs_member_delete_question', { username }),
    });
  }

  resetAllCache() {
    this.RolesApiService.resetAllCache();
    this.RolesAapiService.resetAllCache();
    this.MembersApiService.resetAllCache();
    this.AccountingAapiService.resetAllCache();
  }
}

angular.module('managerApp').service('LogsRolesService', LogsRolesService);
