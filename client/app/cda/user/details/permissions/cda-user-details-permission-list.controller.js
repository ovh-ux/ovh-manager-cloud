angular.module("managerApp")
  .controller("CdaUserDetailsPermissionListCtrl", function ($q, $stateParams, $translate, CloudMessage, OvhApiDedicatedCeph, CdaUserPermissionService) {
      "use strict";

      var self = this;
      self.loading = false;

      self.datas = {
          userPermissions: [],
          pools: [],
          poolsDisplay: []
      };

      function init () {
          self.loading = true;

          $q.allSettled([initUserPermissions(), initPools()]).then(function (poolsData) {
              return computePoolsDisplay(poolsData[0], poolsData[1]);
          }).then(function (poolsDisplay) {
              self.datas.poolsDisplay = poolsDisplay;
          }).catch(function (errors) {
              displayError(_.find(errors, function (error) { return error; }));
          }).finally(function () {
              self.loading = false;
          });
      }

      function initUserPermissions () {
          OvhApiDedicatedCeph.User().Pool().v6().resetQueryCache();

          return OvhApiDedicatedCeph.User().Pool().v6().query({
              serviceName: $stateParams.serviceName,
              userName: $stateParams.userName
          }).$promise.then(function (userPermissions) {
              self.datas.userPermissions = userPermissions;
              return userPermissions;
          });
      }

      function initPools () {
          OvhApiDedicatedCeph.Pool().v6().resetQueryCache();

          return OvhApiDedicatedCeph.Pool().v6().query({
              serviceName: $stateParams.serviceName
          }).$promise.then(function (pools) {
              self.datas.pools = pools;
              return pools;
          });
      }

      function computePoolsDisplay (userPermissions, pools) {
          return CdaUserPermissionService.computePoolsDisplay(userPermissions, pools);
      }

      function displayError (error) {
          CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      init();
  });