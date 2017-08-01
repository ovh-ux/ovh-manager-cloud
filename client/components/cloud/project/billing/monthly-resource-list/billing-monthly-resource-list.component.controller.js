"use strict";

angular.module("managerApp")
  .controller("BillingMonthlyResourceListComponentCtrl", function (DetailsPopoverService) {
      var self = this;
      self.toggle = {
          accordions: {
              instance: false
          }
      };

      self.toggleAccordion = function () {
          DetailsPopoverService.reset();
      };
  });
