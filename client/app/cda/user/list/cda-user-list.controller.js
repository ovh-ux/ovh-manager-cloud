angular.module("managerApp")
  .controller("CdaUserListCtrl", function ($q, $stateParams, $uibModal, $translate, OvhApiDedicatedCeph, Toast, CdaService) {
      "use strict";

      var self = this;

      self.loading = false;

      self.datas = {
          users: []
      };

      self.options = {
          maxPoolDisplay: 4
      };

      self.modals = {
          add: {
              templateUrl: "app/cda/user/add/cda-user-add.html",
              controller: "CdaUserAddCtrl"
          },
          remove: {
              templateUrl: "app/cda/user/delete/cda-user-delete.html",
              controller: "CdaUserDeleteCtrl"
          }
      };

      function init () {
          self.loading = true;
          initUsers().catch(function (error) {
              displayError(error);
          }).finally(function () {
              self.loading = false;
          });
      }

      function initUsers () {
          return CdaService.getUsers($stateParams).then(function(users){
            self.datas.users = users;
            return users;
          });
      }

      self.openAddModal = function () {
          self.openModal(self.modals.add.templateUrl, self.modals.add.controller);
      };

      self.openDeleteModal = function (user) {
          self.openModal(self.modals.remove.templateUrl, self.modals.remove.controller, user);
      };

      self.openModal = function (template, controller, params) {
          var modal = $uibModal.open({
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
              initUsers();
          });
      };

      function displayError (error) {
          Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      self.isTruncatedPoolArray = function (poolArray, index) {
          return poolArray.length - 1 > index;
      };

      init();
  });
