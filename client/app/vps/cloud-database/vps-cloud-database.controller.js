class VpsCloudDatabaseCtrl {
  constructor(
    $q,
    $stateParams,
    $timeout,
    $translate,
    $window,
    CloudMessage,
    ControllerHelper,
    OvhApiHostingPrivateDatabase,
    VpsService,
  ) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.$translate = $translate;
    this.$window = $window;
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.ApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
    this.ApiWhitelist = OvhApiHostingPrivateDatabase.Whitelist().v6();
    this.VpsService = VpsService;
  }

  $onInit() {
    this.serviceName = this.$stateParams.serviceName;

    this.statusFilterOptions = {
      values: _.reduce(
        ['detached', 'restartPending', 'startPending', 'started', 'stopPending', 'stopped'],
        (result, key) => _.assign(result, { [key]: this.$translate.instant(`common_database_status_${key}`) }),
        {},
      ),
    };

    this.ipv4 = null;
    this.cloudDatabases = [];

    this.refresh();
  }

  refresh() {
    this.loading = true;
    return this.loadIps()
      .then((response) => {
        this.ipv4 = _(response.results).chain()
          .find({ version: 'v4' })
          .get('ipAddress')
          .value();
      })
      .then(() => this.loadDatabases())
      .then((databases) => {
        this.cloudDatabases = databases;
        this.loading = false;
      });
  }

  loadIps() {
    return this.VpsService.getIps(this.serviceName);
  }

  loadDatabases() {
    return this.ApiPrivateDb.query().$promise
      .then(serviceNames => this.$q.all(
        _.map(
          serviceNames,
          serviceName => this.ApiPrivateDb.get({ serviceName }).$promise,
        ),
      ))
      .then(databases => _.filter(databases, { offer: 'public' }))
      .then(databases => this.$q.all(
        _.map(
          databases,
          database => this.isVpsAuthorized(database.serviceName)
            .then(vpsAuthorized => _.defaults({ vpsAuthorized }, database)),
        ),
      ))
      .then(databases => _.map(databases, database => _.defaults(
        {
          name: database.displayName || database.serviceName,
        }, database,
      )))
      .catch((error) => {
        this.CloudMessage.error([
          this.$translate.instant('vps_tab_cloud_database_fetch_error'),
          _(error).get('data.message', ''),
        ].join(' '));
      });
  }

  isVpsAuthorized(serviceName) {
    return this.ApiWhitelist.query({ serviceName, ip: this.ipv4, service: true }).$promise
      .then(whitelist => !_.isEmpty(whitelist));
  }

  addAuthorizedIp(database) {
    const { serviceName } = database;
    return this.ApiWhitelist.post(
      { serviceName },
      {
        ip: this.ipv4,
        name: this.$translate.instant(
          'vps_tab_cloud_database_whitelist_ip_name',
          { vps: this.serviceName },
        ),
        service: true,
        sftp: false,
      },
    ).$promise
      .then(() => {
        this.$timeout(() => {
          this.CloudMessage.success(this.$translate.instant('vps_tab_cloud_database_whitelist_add_success'));
          this.refresh();
        }, 2000);
      })
      .catch((error) => {
        this.CloudMessage.error([
          this.$translate.instant('vps_tab_cloud_database_whitelist_add_error'),
          _(error).get('data.message', ''),
        ].join(' '));
      });
  }

  removeAuthorizedIp(database) {
    const { serviceName } = database;
    return this.ApiWhitelist.deleteIp({ serviceName }, { ip: this.ipv4 }).$promise
      .then(() => {
        this.$timeout(() => {
          this.CloudMessage.success(this.$translate.instant('vps_tab_cloud_database_whitelist_remove_success'));
          this.refresh();
        }, 2000);
      })
      .catch((error) => {
        this.CloudMessage.error([
          this.$translate.instant('vps_tab_cloud_database_whitelist_remove_error'),
          _(error).get('data.message', ''),
        ].join(' '));
      });
  }

  goToCloudDatabase(database) {
    const { serviceName } = database;
    this.$window.open(this.ControllerHelper.navigation.getUrl('privateDatabase', { serviceName }));
  }
}

angular.module('managerApp').controller('VpsCloudDatabaseCtrl', VpsCloudDatabaseCtrl);
