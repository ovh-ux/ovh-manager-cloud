import controller from './billing-snapshot-detailed-consumption.component.controller';
import template from './billing-snapshot-detailed-consumption.component.html';

angular.module('managerApp')
  .component('snapshotDetailedConsumption', {
    bindings: {
      snapshots: '<',
    },
    controller,
    template,
  });
