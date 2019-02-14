import controller from './cloud-project-billing-consumption-estimate.controller';
import template from './cloud-project-billing-consumption-estimate.html';

const component = {
  bindings: {
    me: '<',
  },
  controller,
  template,
};

export default component;

angular.module('managerApp')
  .component('cloudProjectBillingConsumptionEstimate', component);
