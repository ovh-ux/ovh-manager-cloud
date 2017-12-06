"use strict";

angular.module("managerApp")
  .controller("BillingVolumeListComponentCtrl", function ($filter, $q, $translate, $stateParams, DetailsPopoverService, OvhApiCloudProjectVolume, Toast, OvhApiMe) {
      var self = this;
      self.DetailsPopoverService = DetailsPopoverService;
      self.volumeConsumptionDetails = [];
      self.currencySymbol = "";
      self.loading = false;
      self.data = {};

      function getVolumesDetails () {
          return OvhApiCloudProjectVolume.Lexi().query({
              serviceName: $stateParams.projectId
          }).$promise.then(function (volumes) {
              return volumes;
          });
      }

      function updateVolumeConsumptionDetails (allProjectVolumes, volumeConsumptions) {
          _.forEach(volumeConsumptions, function (volumeConsumption) {

              var volumeConsumptionDetail = {};
              volumeConsumptionDetail.totalPrice = volumeConsumption.totalPrice.toFixed(2) + " " + self.currencySymbol;
              volumeConsumptionDetail.volumeId = volumeConsumption.volumeId;
              volumeConsumptionDetail.quantity = volumeConsumption.quantity.value;
              volumeConsumptionDetail.region = volumeConsumption.region;
              volumeConsumptionDetail.type = volumeConsumption.type;

              volumeConsumptionDetail.amount = volumeConsumption.quantity.value;

              var volumeDetail = _.find(allProjectVolumes, function (x) { return x.id === volumeConsumption.volumeId; });
              if (volumeDetail) {
                  volumeConsumptionDetail.name = volumeDetail.name;
                  volumeConsumptionDetail.size = volumeDetail.size;
                  volumeConsumptionDetail.status = volumeDetail.status;
              } else {
                  volumeConsumptionDetail.name = volumeConsumption.volumeId;
                  volumeConsumptionDetail.status = "deleted";
              }

              self.volumeConsumptionDetails.push(volumeConsumptionDetail);
          });
      }

      self.$onInit = () => {
          self.loading = true;

          $q.all([initUserCurrency()])
              .then(function () {
                  return initVolumes();
              })
              .catch(function (err) {
                  Toast.error([$translate.instant("cpb_error_message"), err.data && err.data.message || ""].join(" "));
                  $q.reject(err);
              })
              .finally(function () {
                  self.loading = false;
              });
      };

      function initVolumes () {
          return getVolumesDetails()
              .then(function (allProjectVolumes) {
                  return updateVolumeConsumptionDetails(allProjectVolumes, self.volumes);
              });
      }

      function initUserCurrency () {
          return OvhApiMe.Lexi().get().$promise.then(function (me) {
              self.currencySymbol = me.currency.symbol;
          });
      }
  });
