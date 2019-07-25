import controller from './vps-dashboard.controller';
import template from './vps-dashboard.html';

export default {
  bindings: {
    isUSVps: '<',
    stateVps: '<',
  },
  controller,
  name: 'ovhManagerVpsDashboard',
  template,
};
