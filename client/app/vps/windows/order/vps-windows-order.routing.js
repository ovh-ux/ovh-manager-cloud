// New and legacies order views and controllers import
// Legacy
import legacyOrderTemplate from './legacy/vps-windows-order-legacy.html';
import legacyOrderController from './legacy/vps-windows-order-legacy.controller';
// Agora
import orderTemplate from './vps-windows-order.html';
import orderController from './vps-windows-order.controller';

export default /* @ngInject */($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.windows.order', {
    url: '/order',
    templateProvider: /* @ngInject */ (stateVps) => {
      if (stateVps.isLegacy) {
        return legacyOrderTemplate;
      }

      return orderTemplate;
    },
    controllerProvider: /* @ngInject */ (stateVps) => {
      if (stateVps.isLegacy) {
        return legacyOrderController;
      }

      return orderController;
    },
    controllerAs: '$ctrl',
    translations: {
      value: ['./'],
      format: 'json',
    },
  });
};
