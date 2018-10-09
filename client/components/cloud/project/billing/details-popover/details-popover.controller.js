

angular.module('managerApp').controller('DetailsPopoverController', function (DetailsPopoverService, RegionService) {
  const self = this;
  self.RegionService = RegionService;

  self.closePopover = function () {
    DetailsPopoverService.reset();
  };

  function init() {
    self.details = DetailsPopoverService.getCurrentDetails();
  }

  init();
});
