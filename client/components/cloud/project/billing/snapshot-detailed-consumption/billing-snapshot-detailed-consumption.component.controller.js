export default class {
  /* @ngInject */
  constructor($q, $stateParams, $translate, OvhApiCloudProjectImage, RegionService) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.OvhApiCloudProjectImage = OvhApiCloudProjectImage;
    this.RegionService = RegionService;
  }

  $onInit() {
    this.serviceName = this.$stateParams.projectId;
  }

  getImageName(imageId) {
    if (!imageId) {
      return this.$q.when(
        this.$translate.instant('cpbc_snapshot_migrated'),
      );
    }

    return this.OvhApiCloudProjectImage
      .v6().get({ serviceName: this.serviceName, imageId }).$promise
      .then(({ name }) => name)
      .catch(() => imageId);
  }

  getImageDetails(image) {
    return this.getImageName(image.imageId)
      .then(name => ({
        ...image,
        name,
      }));
  }

  getSnapshotPriceInfoTooltip(snapshot) {
    return this.$translate.instant('cpbc_snapshot_col_usage_info_part1')
      .concat(this.$translate.instant('cpbc_snapshot_col_usage_info_part2', {
        amount: _.get(snapshot, 'quantity.value', 0),
      }));
  }
}

angular.module('managerApp').controller('BillingSnapshotDetailedComponentCtrl');
