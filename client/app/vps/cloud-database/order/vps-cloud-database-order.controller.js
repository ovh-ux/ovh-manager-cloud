class VpsCloudDatabaseOrderCtrl {
  constructor(
    $q,
    $timeout,
    $translate,
    $window,
    atInternet,
    CloudMessage,
    OvhApiHostingPrivateDatabase,
    OvhApiOrderPrivateDatabase,
    OvhApiMe,
  ) {
    this.$q = $q;
    this.$timeout = $timeout;
    this.$translate = $translate;
    this.$window = $window;
    this.atInternet = atInternet;
    this.CloudMessage = CloudMessage;
    this.ApiPrivateDb = OvhApiHostingPrivateDatabase.v6();
    this.ApiOrderDb = OvhApiOrderPrivateDatabase.v6();
    this.ApiMe = OvhApiMe.v6();
  }

  $onInit() {
    this.loading = {
      durations: false,
      redirection: false,
      purchaseOrder: false,
    };

    this.versions = [];
    this.ramAmounts = [];
    this.datacenters = [];
    this.durations = null;

    this.currentOrder = {
      version: null,
      ram: null,
      datacenter: null,
      duration: null,
      contractsAccepted: false,
    };

    this.purchaseOrder = null;
    this.redirectionTimeout = null;

    this.loadSelectValues();
    this.ApiMe.get().$promise.then((user) => {
      this.user = user;
    });
  }

  loadSelectValues() {
    return this.ApiPrivateDb.availableOrderCapacities({ offer: 'public' }).$promise
      .then((capacity) => {
        this.versions = _(capacity.version).sortBy().map(version => ({
          value: version,
          name: this.$translate.instant(`common_database_version_${version.replace('.', '')}`),
        })).value();
        this.ramAmounts = _(capacity.ram).map(ram => ({
          value: ram,
          name: `${ram} ${this.$translate.instant('unit_size_MB')}`,
        })).value();
        this.datacenters = _(capacity.datacenter).map(datacenter => ({
          value: datacenter,
          name: this.$translate.instant(`common_datacenter_${datacenter}`),
        })).value();
      })
      .catch(error => this.CloudMessage.error([
        this.$translate.instant('vps_tab_cloud_database_order_fetch_capacities_failed'),
        _(error).get('data.message', error),
      ].join(' ')));
  }

  showOrRefreshDurations() {
    this.cancelFurtherChoices();

    if (!this.currentOrder.version
      || !this.currentOrder.ram
      || !this.currentOrder.datacenter) {
      return this.$q.when();
    }

    const version = this.currentOrder.version.value;
    const ram = this.currentOrder.ram.value;
    const datacenter = this.currentOrder.datacenter.value;

    this.loading.durations = true;
    return this.ApiOrderDb.getNew({ version, ram, datacenter }).$promise
      .then((durations) => {
        this.durations = _.map(durations, duration => ({ value: duration, prices: null }));
        // we run this in parallel, so no return
        this.getPricesForEachDuration(this.durations, version, ram, datacenter);
      })
      .catch(error => this.CloudMessage.error([
        this.$translate.instant('vps_tab_cloud_database_order_fetch_duration_failed'),
        _(error).get('data.message', error),
      ].join(' ')))
      .finally(() => {
        this.loading.durations = false;
      });
  }

  cancelFurtherChoices() {
    this.$timeout.cancel(this.redirectionTimeout);
    this.loading.purchaseOrder = false;
    this.loading.redirection = false;

    this.currentOrder.duration = null;
    this.currentOrder.contractsAccepted = false;
    this.purchaseOrder = null;
  }

  getPricesForEachDuration(durations, version, ram, datacenter) {
    return this.$q.all(_.map(
      durations,
      duration => this.getPrices(duration, version, ram, datacenter),
    )).catch(error => this.CloudMessage.error([
      this.$translate.instant('vps_tab_cloud_database_order_fetch_prices_failed'),
      _(error).get('data.message', error),
    ].join(' ')));
  }

  getPrices(duration, version, ram, datacenter) {
    return this.ApiOrderDb.getNewDetails({
      duration: duration.value, version, ram, datacenter,
    }).$promise
      .then((details) => {
        // we actually want to trigger a change in the UI
        // by assigning prices to each already shown duration
        duration.details = details; // eslint-disable-line no-param-reassign
      });
  }

  canOrder() {
    return !_.any(this.loading)
      && this.currentOrder.version
      && this.currentOrder.ram
      && this.currentOrder.datacenter
      && this.currentOrder.duration
      && this.currentOrder.contractsAccepted;
  }

  generatePurchaseOrder() {
    this.loading.purchaseOrder = true;
    this.loading.redirection = true;
    return this.ApiOrderDb.orderNew(
      { duration: this.currentOrder.duration.value },
      {
        version: this.currentOrder.version.value,
        ram: this.currentOrder.ram.value,
        datacenter: this.currentOrder.datacenter.value,
        offer: 'public',
      },
    ).$promise
      .then((order) => {
        this.purchaseOrder = order;
        this.redirectionTimeout = this.$timeout(() => {
          this.loading.redirection = false;
          this.openPurchaseOrder(false);
        }, 5000);
      })
      .catch(error => this.CloudMessage.error([
        this.$translate.instant('vps_tab_cloud_database_order_failed'),
        _(error).get('data.message', error),
      ].join(' ')))
      .finally(() => {
        this.loading.purchaseOrder = false;
      });
  }

  openPurchaseOrder(killAutoRedirection) {
    if (killAutoRedirection) {
      this.loading.redirection = false;
      this.$timeout.cancel(this.redirectionTimeout);
    }

    this.atInternet.trackOrder({
      name: `[sql-public]::${this.currentOrder.version.value}`,
      page: 'web::payment-pending',
      orderId: this.purchaseOrder.orderId,
      priceTaxFree: this.purchaseOrder.prices.withoutTax.value,
      price: this.purchaseOrder.prices.withTax.value,
      status: 1,
    });
    this.$window.open(this.purchaseOrder.url);
  }
}

angular.module('managerApp').controller('VpsCloudDatabaseOrderCtrl', VpsCloudDatabaseOrderCtrl);
