angular.module('managerApp')
  .service('CloudProjectCompute', class CloudProjectCompute {
    constructor(
      $q,
      OvhApiCloudProjectInstance, OvhApiCloudProjectRegion, OvhApiCloudProjectRegionWorkflowBackup,
    ) {
      this.$q = $q;
      this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
      this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
      this.OvhApiCloudProjectRegionWorkflowBackup = OvhApiCloudProjectRegionWorkflowBackup;
    }

    getInstances(serviceName) {
      return this.OvhApiCloudProjectInstance.v6().query({ serviceName }).$promise;
    }

    getInstance(serviceName, instanceId) {
      return this.OvhApiCloudProjectInstance.v6().get({ serviceName, instanceId }).$promise;
    }

    getWorkflowBackup(serviceName, regionName) {
      return this.OvhApiCloudProjectRegionWorkflowBackup
        .v6()
        .query({ serviceName, regionName })
        .$promise;
    }

    getRegions(serviceName) {
      return this.OvhApiCloudProjectRegion.v6().query({ serviceName }).$promise;
    }

    getRegion(serviceName, regionName) {
      return this.OvhApiCloudProjectRegion.v6().get({ serviceName, id: regionName }).$promise;
    }

    getRegionsWithWorkflowService(serviceName) {
      return this.getRegions(serviceName)
        .then(regions => this.$q.allSettled(
          _.map(regions, region => this.getRegion(serviceName, region)),
        ))
        .then(detailedRegions => _.chain(detailedRegions).filter(region => this.constructor.isWorkflowServiceUp(region)).map('name').value());
    }

    static isWorkflowServiceUp(region) {
      return !_.isUndefined(_.find(region.services, { name: 'workflow', status: 'UP' }));
    }

    createWorkflowBackup(serviceName, regionName, backupParams) {
      return this.OvhApiCloudProjectRegionWorkflowBackup.v6().save({
        serviceName, regionName,
      }, backupParams).$promise;
    }

    deleteWorkflowBackup(serviceName, regionName, backupId) {
      this.OvhApiCloudProjectRegionWorkflowBackup.v6().resetQueryCache();
      return this.OvhApiCloudProjectRegionWorkflowBackup.v6().delete({
        serviceName, regionName, backupId,
      }).$promise;
    }
  });
