// Agora and legacies order views and controllers import
// Legacy
import legacyTpl from './legacy/vps-windows-order-legacy.html';
import legacyCtrl from './legacy/vps-windows-order-legacy.controller';
// Agora
import agoraTpl from './vps-windows-order.html';
import agoraCtrl from './vps-windows-order.controller';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.windows.order', {
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
