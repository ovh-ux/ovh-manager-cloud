"use strict";

angular.module("managerApp")
  .controller("BillingHourlyResourceListComponentCtrl", function (DetailsPopoverService) {
      var self = this;

      self.toggle = {
          accordions: {
              instance: false,
              objectStorage: false,
              archiveStorage: false,
              snapshot: false,
              volume: false
          }
      };

      self.toggleAccordion = function () {
          DetailsPopoverService.reset();
      };
  });
