angular.module("managerApp")
  .controller("CdaUserDetailsPermissionListEditCtrl", function ($q, $stateParams, $translate, $state, CloudMessage, OvhApiDedicatedCeph, CdaUserPermissionService) {
      "use strict";

      var self = this;

      self.loading = false;
      self.saving = false;

      self.serviceName = $stateParams.serviceName;
      self.userName = $stateParams.userName;

      self.states = {
          permissionList: "paas.cda.cda-details.cda-user.cda-user-details.cda-user-details-permission-list"
      };

      self.datas = {
          userPermissions: [],
          pools: [],
          poolsDisplay: []
      };

      self.accessTypes = [];

      function init () {
          self.loading = true;
          self.accessTypes = CdaUserPermissionService.accessTypes;

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
          OvhApiDedicatedCeph.User().Pool().Lexi().resetQueryCache();

          return OvhApiDedicatedCeph.User().Pool().Lexi().query({
              serviceName: $stateParams.serviceName,
              userName: $stateParams.userName
          }).$promise.then(function (userPermissions) {
              self.datas.userPermissions = userPermissions;
              return userPermissions;
          });
      }

      function initPools () {
          OvhApiDedicatedCeph.Pool().Lexi().resetQueryCache();

          return OvhApiDedicatedCeph.Pool().Lexi().query({
              serviceName: $stateParams.serviceName
          }).$promise.then(function (pools) {
              self.datas.pools = pools;
              return pools;
          });
      }

      function computePoolsDisplay (userPermissions, pools) {
          return CdaUserPermissionService.computePoolsDisplay(userPermissions, pools);
      }

      self.saveUserPermissions = function () {
          self.saving = true;
          var typeKeys = _.keys(self.accessTypes);
          var permissionsToSave = _.filter(self.datas.poolsDisplay, function (pool) {
              var permissions = _.values(_.pick(pool, typeKeys));
              return hasActivePermissionForPool(permissions);
          });

          return OvhApiDedicatedCeph.User().Pool().Lexi().post({
              serviceName: $stateParams.serviceName,
              userName: $stateParams.userName
          }, {
              permissions: permissionsToSave
          }).$promise.then(function () {
              CloudMessage.success($translate.instant("cda_user_details_permissions_list_edit_success"));
              $state.go(self.states.permissionList);
          }).catch(function (error) {
              displayError(error);
          }).finally(function () {
              self.saving = false;
          });
      };

      function hasActivePermissionForPool (permissions) {
          return _.findIndex(permissions, function (value) { return value === true; }) !== -1;
      }

      function displayError (error) {
          CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      init();
  });