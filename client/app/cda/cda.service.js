angular.module("managerApp")
  .service("CdaService", function ($q, $translate, OvhApiDedicatedCeph, SidebarMenu, CloudMessage) {
      "use strict";
      var self = this;

      self.currentService = {};

      self.initDetails = function (serviceName, forceRefresh) {
          if (!serviceName) {
              self.currentService = {};
              return $q.reject();
          }

          if (self.currentService.serviceName !== serviceName || forceRefresh === true) {
              OvhApiDedicatedCeph.Lexi().resetQueryCache();
              return OvhApiDedicatedCeph.Lexi().get({
                  serviceName: serviceName
              }).$promise.then(function (cda) {
                  self.currentService = cda;
                  return cda;
              }).catch(function (error) {
                  CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
              });
          } else {
              return $q.when(self.currentService);
          }
      };

      self.updateDetails = function (serviceName, label, crushTunable) {
          self.saving = true;
          return OvhApiDedicatedCeph.Lexi().put({
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
              return $q.reject(error);
          });
      };

      self.changeMenuTitle = function (serviceName, label) {
          var menuItem = SidebarMenu.getItemById(serviceName);
          if (menuItem) {
              menuItem.title = label;
          }
      };

      self.getUsers = function (params) {
          OvhApiDedicatedCeph.User().Aapi().resetCache();

          return OvhApiDedicatedCeph.User().Aapi().users({
              serviceName: params.serviceName
          }).$promise.then(function (users) {
              return users;
          });
      }
  });
