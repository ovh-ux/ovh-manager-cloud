angular.module('managerApp').component('cloudSpaceMeterSpaceLeft', {
  templateUrl: 'components/cloud/cloud-space-meter-space-left/cloud-space-meter-space-left.html',
  bindings: {
    usage: '<',
    tooltip: '<',
    strong: '<',
    direction: '<',
  },
  controller($element) {
    this.$onInit = () => {
      this.direction = this.direction || 'row';
    };
    $element.addClass(`cloud-space-meter-space-left_${this.direction}`);
  },
});
