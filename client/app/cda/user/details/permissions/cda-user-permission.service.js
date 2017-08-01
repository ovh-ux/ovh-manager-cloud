angular.module("managerApp")
  .service("CdaUserPermissionService", function ($q) {
      "use strict";
      var self = this;

      self.accessTypes = {
          read: false,
          write: false,
          execute: false,
          classRead: false,
          classWrite: false
      };

      self.computePoolsDisplay = function (userPermissions, pools) {
          var permissionsObject = {};
          _.forEach(userPermissions, function (userPermission) {
              permissionsObject[userPermission.poolName] = userPermission;
          });

          return $q.when(_.map(pools, function (pool) {
              if (permissionsObject[pool.name]) {
                  return _.cloneDeep(permissionsObject[pool.name]);
              } else {
                  var defaultPermission = _.clone(self.accessTypes);
                  defaultPermission.poolName = pool.name;
                  return defaultPermission;
              }
          }));
      };
  });