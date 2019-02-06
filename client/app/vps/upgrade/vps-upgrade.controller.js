export default class VpsUpgradeCtrl {
  /* @ngInject */
  constructor($window, availableOffers, CloudMessage, connectedUser,
    OvhApiOrder, OvhApiVps, stateVps, URLS) {
    // dependencies injections
    this.$window = $window;
    this.availableOffers = availableOffers;
    this.CloudMessage = CloudMessage;
    this.connectedUser = connectedUser;
    this.OvhApiOrder = OvhApiOrder;
    this.OvhApiVps = OvhApiVps;
    this.stateVps = stateVps;
    this.URLS = URLS;

    // other attributes used in view
    this.serviceName = this.stateVps.name;
    this.chunkedAvailableUpgrade = null;
    this.getMonthlyPrice = VpsUpgradeCtrl.getMonthlyPrice;

    this.loading = {
      init: false,
      upgrade: false,
    };

    this.model = {
      offer: null,
    };
  }

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

  static findMatchingUpgradeOffer(modelType, modelName, modelVersion, availableOffers) {
    const versionInfos = VpsUpgradeCtrl.parseModelVersion(modelVersion);
    const destVersion = versionInfos.year < 2018 ? '2018v3' : '2018v4';
    const offerPlanCode = `vps_${modelType}_${modelName}_${destVersion}`;

    return _.find(availableOffers, {
      planCode: offerPlanCode,
    });
  }

  static getMonthlyPrice(offer) {
    return _.find(offer.offer.details.prices, {
      duration: 'P1M',
    });
  }

  /* =============================
  =            Events            =
  ============================== */

  onUpgradeFormSubmit() {
    this.loading.upgrade = true;

    return this.OvhApiOrder.Upgrade().Vps().v6().get({
      serviceName: this.serviceName,
      planCode: this.model.offer.offer.details.planCode,
    }).$promise
      .then(() => {
        // redirect to express order
        const expressOrderUrl = _.get(
          this.URLS.website_order.express_base,
          this.connectedUser.ovhSubsidiary,
        );

        const order = {
          planCode: 'vps_ssd',
          serviceName: this.stateVps.name,
          productId: 'vps',
          option: [{
            planCode: this.model.offer.offer.details.planCode,
            duration: 'P1M',
            pricingMode: 'default',
            quantity: 1,
          }],
        };

        this.$window.open(`${expressOrderUrl}?products=${JSURL.stringify([order])}`, '_blank');
      })
      .finally(() => {
        this.loading.upgrade = false;
      });
  }

  /* -----  End of Events  ------ */

  /* =====================================
  =            Initialization            =
  ====================================== */

  $onInit() {
    this.loading.init = true;

    return this.OvhApiVps.v6().availableUpgrade({
      serviceName: this.serviceName,
    }).$promise
      .then((availableUpgradeParam) => {
        const availableUpgrade = _.map(availableUpgradeParam, (upgradeParam) => {
          const upgrade = upgradeParam;
          upgrade.isCurrentOffer = false;
          upgrade.offer = {
            name: upgrade.offer,
            details: VpsUpgradeCtrl.findMatchingUpgradeOffer(
              this.stateVps.offerType,
              upgrade.name,
              upgrade.version,
              this.availableOffers,
            ),
          };
          return upgrade;
        });

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
              this.availableOffers,
            ),
          },
          vcore: this.stateVps.model.vcore,
          version: this.stateVps.model.version,
        }].concat(availableUpgrade), 3);
      })
      .catch((error) => {
        this.CloudMessage.error([
          this.$translate.instant('vps_configuration_upgradevps_fail'),
          _.get(error, 'message'),
        ].join(' '));
      })
      .finally(() => {
        this.loading.init = false;
      });
  }

  /* -----  End of Initialization  ------ */
}
