angular.module("managerApp")
  .controller("CdaIpListCtrl", function ($q, $stateParams, $uibModal, $translate, OvhApiDedicatedCeph, CloudMessage) {
      "use strict";

      var self = this;

      self.loading = false;

      self.datas = {
          ips: []
      };

      self.modals = {
          add: {
              templateUrl: "app/cda/ip/add/cda-ip-add.html",
              controller: "CdaIpAddCtrl"
          },
          remove: {
              templateUrl: "app/cda/ip/delete/cda-ip-delete.html",
              controller: "CdaIpDeleteCtrl"
          }
      };

      function init () {
          self.loading = true;
          initIps().catch(function (error) {
              displayError(error);
          }).finally(function () {
              self.loading = false;
          });
      }

      function initIps () {
          OvhApiDedicatedCeph.Acl().Lexi().resetAllCache();
          return OvhApiDedicatedCeph.Acl().Lexi().query({
              serviceName: $stateParams.serviceName
          }).$promise.then(function (ips) {
              self.datas.ips = ips;
              return ips;
          });
      }

      self.openAddModal = function () {
          self.openModal(self.modals.add.templateUrl, self.modals.add.controller);
      };

      self.openDeleteModal = function (ip) {
          self.openModal(self.modals.remove.templateUrl, self.modals.remove.controller, { ip: ip });
      };

      self.openModal = function (template, controller, params) {
          var modal = $uibModal.open({
              windowTopClass: "cui-modal",
              templateUrl: template,
              controller: controller,
              controllerAs: controller,
              resolve: {
                  items: function () {
                      return params;
                  }
              }
          });

          modal.result.then(function () {
              initIps();
          });
      };

      function displayError (error) {
          CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      init();
  });