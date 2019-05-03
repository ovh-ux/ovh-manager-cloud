import { OFFER_AGORA_MAPPING } from './vps-upgrade.constants';

export default class VpsUpgradeCtrl {
  /* @ngInject */
  constructor($q, $translate, $window, CucCloudMessage, connectedUser, OvhApiOrder,
    OvhApiVps, stateVps) {
    // dependencies injections
    this.$q = $q;
    this.$translate = $translate;
    this.$window = $window;
    this.CucCloudMessage = CucCloudMessage;
    this.connectedUser = connectedUser;
    this.OvhApiOrder = OvhApiOrder;
    this.OvhApiVps = OvhApiVps;
    this.stateVps = stateVps;

    // other attributes used in view
    this.serviceName = this.stateVps.name;
    this.chunkedAvailableUpgrade = null;
    this.getMonthlyPrice = VpsUpgradeCtrl.getMonthlyPrice;

    this.loading = {
      init: false,
      contracts: false,
      order: false,
    };

    this.model = {
      offer: null,
      contracts: false,
    };
  }

  /**
   *  Parse the model version by extracting the year and the version into this year
   */
  static parseModelVersion(modelVersion) {
    const parseRegexp = new RegExp(/(\d{4})v(\d+)/);
    if (parseRegexp.test(modelVersion)) {
      const versionParts = parseRegexp.exec(modelVersion);
      return {
        year: parseInt(versionParts[1], 10),
        version: parseInt(versionParts[2], 10),
      };
    }

    throw new Error(`Provided modelVersion (${modelVersion}) is not supported.`);
  }

  /**
   *  Get the plan code for agora order from VPS model informations
   */
  static findMatchingUpgradeOffer(modelType, modelName, modelVersion, availableOffers) {
    // rules are :
    // - if version year is less than 2018, agora version will be 2018v3
    // - otherwise agora version will be 2018v4
    const versionInfos = VpsUpgradeCtrl.parseModelVersion(modelVersion);
    const destVersion = versionInfos.year < 2018 ? '2018v3' : '2018v4';
    const mappedType = _.get(OFFER_AGORA_MAPPING, modelType, modelType);
    const offerPlanCode = `vps_${mappedType}_${modelName}_${destVersion}`;

    return _.find(availableOffers, {
      planCode: offerPlanCode,
    });
  }

  /**
   *  Find the monthly price object of given offer
   */
  static getMonthlyPrice(offer) {
    return _.find(offer.offer.details.prices, {
      duration: 'P1M',
    });
  }

  /* =============================
  =            Events            =
  ============================== */

  onContractsStepFormFocus() {
    this.loading.contracts = true;
    this.model.contracts = false;

    return this.OvhApiOrder.Upgrade().Vps().v6().get({
      serviceName: this.serviceName,
      planCode: this.model.offer.offer.details.planCode,
    }).$promise
      .then((order) => {
        this.order = order.order;
        this.order.contracts = _.map(this.order.contracts, (contractParam) => {
          const contract = contractParam;
          contract.expanded = false;
          return contract;
        });
      })
      .catch((error) => {
        this.CucCloudMessage.error([
          this.$translate.instant('vps_configuration_upgradevps_fail'),
          _.get(error, 'data.message'),
        ].join(' '));
      })
      .finally(() => {
        this.loading.contracts = false;
      });
  }

  toggleContractExpand(toggledContract) {
    // if contract is not expanded
    // hide all contracts
    if (!toggledContract.expanded) {
      this.order.contracts.forEach((contract) => {
        _.set(contract, 'expanded', false);
      });
    }
    // toggle expand state of contract
    _.set(toggledContract, 'expanded', !toggledContract.expanded);
  }

  onStepperFinish() {
    this.loading.order = true;

    return this.OvhApiOrder.Upgrade().Vps().v6().save({
      serviceName: this.serviceName,
      planCode: this.model.offer.offer.details.planCode,
    }, {
      quantity: 1,
    }).$promise
      .then((response) => {
        // open order url
        this.$window.open(response.order.url, '_blank');

        // display success message
        this.CucCloudMessage.success({
          textHtml: this.$translate.instant('vps_configuration_upgradevps_success', {
            orderId: response.order.orderId,
            url: response.order.url,
          }),
        });

        // reinit the form
        return this.$onInit();
      })
      .catch((error) => {
        this.CucCloudMessage.error([
          this.$translate.instant('vps_configuration_upgradevps_fail'),
          _.get(error, 'data.message'),
        ].join(' '));
      })
      .finally(() => {
        this.loading.order = false;
      });
  }

  /* -----  End of Events  ------ */

  /* =====================================
  =            Initialization            =
  ====================================== */

  $onInit() {
    this.loading.init = true;

    this.model.offer = null;

    return this.$q.all({
      availableUpgrades: this.OvhApiVps.v6().availableUpgrade({
        serviceName: this.serviceName,
      }).$promise,
      availableOffers: this.OvhApiOrder.Upgrade().Vps().v6().getAvailableOffers({
        serviceName: this.serviceName,
      }).$promise,
    })
      .then(({ availableUpgrades, availableOffers }) => {
        // map available upgrades by adding details with the informations
        // provided by /order/upgrade/vps API response
        const availableUpgrade = _.map(availableUpgrades, (upgradeParam) => {
          const upgrade = upgradeParam;
          upgrade.isCurrentOffer = false;
          upgrade.offer = {
            name: upgrade.offer,
            details: VpsUpgradeCtrl.findMatchingUpgradeOffer(
              this.stateVps.offerType,
              upgrade.name,
              upgrade.version,
              availableOffers,
            ),
          };
          return upgrade;
        });

        // set current offer in available upgrade and concat with availabe ones
        // then chunk the list for responsive display
        this.chunkedAvailableUpgrade = _.chunk([{
          isCurrentOffer: true,
          disk: this.stateVps.model.disk,
          memory: this.stateVps.model.memory,
          name: this.stateVps.model.name,
          offer: {
            name: this.stateVps.model.offer,
            details: VpsUpgradeCtrl.findMatchingUpgradeOffer(
              this.stateVps.offerType,
              this.stateVps.model.name,
              this.stateVps.model.version,
              availableOffers,
            ),
          },
          vcore: this.stateVps.model.vcore,
          version: this.stateVps.model.version,
        }].concat(availableUpgrade), 3);
      })
      .catch((error) => {
        this.CucCloudMessage.error([
          this.$translate.instant('vps_configuration_upgradevps_fail'),
          _.get(error, 'data.message'),
        ].join(' '));
      })
      .finally(() => {
        this.loading.init = false;
      });
  }

  /* -----  End of Initialization  ------ */
}
