angular.module('managerApp').component('cloudSpaceMeter', {
  templateUrl: 'components/cloud/cloud-space-meter/cloud-space-meter.html',
  bindings: {
    legend: '<',
    large: '<',
    usage: '<',
  },
  controller() {
    this.getMaxSize = function () {
      if (!_.has(this.usage, 'size.value')) {
        return null;
      }

      return parseInt(this.usage.size.value, 10);
    };
  },
});
