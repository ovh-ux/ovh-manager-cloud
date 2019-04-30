import { vpsHeader } from '../vps';

// Agora and legacies order views and controllers import
// VPS upgrade legacy
import legacyTpl from './legacy/vps-upgrade-legacy.html';
import legacyCtrl from './legacy/vps-upgrade-legacy.controller';
// VPS upgrade Agora
import agoraTpl from './vps-upgrade.html';
import agoraCtrl from './vps-upgrade.controller';

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.upgrade', {
    url: '/upgrade',
    views: {
      vpsHeader,
      vpsContent: {
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
      },
    },
    translations: {
      value: ['./'],
      format: 'json',
    },
  });
});
