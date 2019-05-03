// Agora and legacies order views and controllers import
// VPS upgrade legacy
import legacyTpl from './legacy/vps-backup-storage-order-legacy.html';
import legacyCtrl from './legacy/vps-backup-storage-order-legacy.controller';
// VPS upgrade agora
import agoraTpl from './vps-backup-storage-order.html';
import agoraCtrl from './vps-backup-storage-order.controller';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.backup-storage.order', {
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
