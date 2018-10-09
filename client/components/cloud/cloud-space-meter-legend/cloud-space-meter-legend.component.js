angular.module('managerApp').component('cloudSpaceMeterLegend', {
  templateUrl: 'components/cloud/cloud-space-meter-legend/cloud-space-meter-legend.html',
  bindings: {
    usage: '<',
    direction: '<',
  },
  controller() {
    this.$onInit = () => {
      this.direction = this.direction || 'row';
    };

    this.getIconName = function (type) {
      switch (type) {
        case 'usedbysnapshots': return 'serverSave';
        default: return 'harddisk';
      }
    };
  },
});
