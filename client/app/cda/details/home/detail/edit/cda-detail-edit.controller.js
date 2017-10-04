angular.module("managerApp")
  .controller("CdaDetailEditCtrl", function ($q, $uibModalInstance, $translate, $stateParams, CloudMessage, CdaService, items) {
      "use strict";

      var self = this;
      self.model = {
          label: "",
          crushTunable: ""
      };

      self.options = {
          label: {
              maxLength: 25
          }
      };

      self.crushTunableValues = [];

      self.saving = false;

      function init () {
          var details = items.details;
          self.model.label = details.label;
          self.model.crushTunable = details.crushTunables;
          self.crushTunableValues = items.crushTunablesOptions;
      }

      self.editCluster = function () {
          self.saving = true;
          return CdaService.updateDetails($stateParams.serviceName, self.model.label, self.model.crushTunable).then(function () {
              $uibModalInstance.close();
              CloudMessage.success($translate.instant("cda_detail_edit_success"));
          }).catch(function (error) {
              CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          }).finally(function () {
              self.saving = false;
          });
      };

      self.closeModal = function () {
          $uibModalInstance.dismiss();
      };

      init();
  });