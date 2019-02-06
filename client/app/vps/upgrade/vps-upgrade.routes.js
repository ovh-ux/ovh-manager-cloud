import { vpsHeader } from '../vps';

// Agora and legacies order views and controllers import
// VPS upgrade legacy
import legacyUpgradeTpl from './legacy/vps-upgrade-legacy.html';
import legacyUpgradeCtrl from './legacy/vps-upgrade-legacy.controller';
// VPS upgrade Agora
import agoraUpgradeTpl from './vps-upgrade.html';
import agoraUpgradeCtrl from './vps-upgrade.controller';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.upgrade', {
    url: '/upgrade',
    resolve: {
      availableOffers: /* @ngInject */ (stateVps, OvhApiOrder) => {
        const serviceName = stateVps.name;
        return OvhApiOrder.Upgrade().Vps().v6().getAvailableOffers({
          serviceName,
        }).$promise;
      },
    },
    views: {
      vpsHeader,
      vpsContent: {
        templateProvider: /* @ngInject */ (availableOffers) => {
          if (!availableOffers.length) {
            return legacyUpgradeTpl;
          }
          return agoraUpgradeTpl;
        },
        controllerProvider: /* @ngInject */ (availableOffers) => {
          if (!availableOffers.length) {
            return legacyUpgradeCtrl;
          }
          return agoraUpgradeCtrl;
        },
        controllerAs: '$ctrl',
      },
    },
    translations: {
      value: ['./'],
      format: 'json',
    },
  });
});
