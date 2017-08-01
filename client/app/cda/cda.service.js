angular.module("managerApp")
  .service("CdaService", function ($q, $translate, DedicatedCeph, SidebarMenu, Toast) {
      "use strict";
      var self = this;

      self.currentService = {};

      self.initDetails = function (serviceName, forceRefresh) {
          if (!serviceName) {
              self.currentService = {};
              return $q.reject();
          }

          if (self.currentService.serviceName !== serviceName || forceRefresh === true) {
              DedicatedCeph.Lexi().resetQueryCache();
              return DedicatedCeph.Lexi().get({
                  serviceName: serviceName
              }).$promise.then(function (cda) {
                  self.currentService = cda;
                  return cda;
              }).catch(function (error) {
                  Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
              });
          } else {
              return $q.when(self.currentService);
          }
      };

      self.updateDetails = function (serviceName, label, crushTunable) {
          self.saving = true;
          return DedicatedCeph.Lexi().put({
              serviceName: serviceName
          }, {
              serviceName: serviceName,
              crushTunables: crushTunable,
              label: label
          }).$promise.then(function () {
              self.initDetails(serviceName, true).then(function () {
                  self.changeMenuTitle(serviceName, self.currentService.label ? self.currentService.label : self.currentService.serviceName);
              });
          }).catch(function (error) {
              Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
          });
      };

      self.changeMenuTitle = function (serviceName, label) {
          var menuItem = SidebarMenu.getItemById(serviceName);
          if (menuItem) {
              menuItem.title = label;
          }
      };

      self.getUsers = function (params) {
          DedicatedCeph.User().Aapi().resetCache();

          return DedicatedCeph.User().Aapi().users({
              serviceName: params.serviceName
          }).$promise.then(function (users) {
              return users;
          });
      }
  });
