// Agora and legacies order views and controllers import
// VPS legacy
import legacyTpl from './legacy/vps-veeam-order-legacy.html';
import legacyCtrl from './legacy/vps-veeam-order-legacy.controller';
// VPS agora
import agoraTpl from './vps-veeam-order.html';
import agoraCtrl from './vps-veeam-order.controller';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.veeam.order', {
    url: '/order',
    templateProvider: /* @ngInject */ (stateVps) => {
      if (!stateVps.isFullAgora) {
        return legacyTpl;
      }

      return agoraTpl;
    },
    controllerProvider: /* @ngInject */ (stateVps) => {
      if (!stateVps.isFullAgora) {
        return legacyCtrl;
      }

      return agoraCtrl;
    },
    controllerAs: '$ctrl',
    translations: {
      value: ['./'],
      format: 'json',
    },
  });
});
