 "use strict";

angular.module("managerApp")
  .controller("DetailsPopoverController", function (DetailsPopoverService) {
      var self = this;

      self.closePopover = function () {
          DetailsPopoverService.reset();
      };

      function init () {
          self.details = DetailsPopoverService.getCurrentDetails();
      }

      init();
  });
