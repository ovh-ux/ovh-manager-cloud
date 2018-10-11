angular.module('managerApp').controller('KubernetesNodesAddCtrl', class KubernetesNodesAddCtrl {
  constructor(
    $stateParams, $translate, $uibModalInstance,
    CloudFlavorService, Kubernetes, projectId,
    CLOUD_FLAVORTYPE_CATEGORY, KUBERNETES,
  ) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.CloudFlavorService = CloudFlavorService;
    this.Kubernetes = Kubernetes;
    this.projectId = projectId;
    this.CLOUD_FLAVORTYPE_CATEGORY = CLOUD_FLAVORTYPE_CATEGORY;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loading = true;
    this.serviceName = this.$stateParams.serviceName;

    this.getPublicCloudProjectId()
      .then(() => this.getProjectQuota())
      .then(() => this.getFlavors())
      .catch(error => this.$uibModalInstance.dismiss(this.$translate.instant('kube_nodes_add_flavor_error', { message: error })))
      .finally(() => { this.loading = false; });
  }

  getPublicCloudProjectId() {
    return this.Kubernetes.getAssociatedPublicCloudProjects(this.serviceName)
      .then((projects) => { this.project = _.first(projects); });
  }

  getProjectQuota() {
    return this.Kubernetes.getProjectQuota(this.project.projectId)
      .then((quotas) => { this.quotas = quotas; });
  }

  getFlavors() {
    return this.Kubernetes.getFlavors(this.projectId)
      .then((flavors) => {
        /**
        * @type {{id: string, familyName: string, flavors: Object[]}}
        */
        this.flavorFamilies = _.chain(this.CLOUD_FLAVORTYPE_CATEGORY)
          .filter(type => _.includes(this.KUBERNETES.flavorTypes, type.id))
          .map(category => (
            {
              id: category.id,
              familyName: this.$translate.instant(`kube_nodes_add_flavor_family_${category.id}`),
              flavors: _.chain(flavors)
                .filter(flavor => _.includes(category.types, flavor.type))
                .map(flavor => (
                  {
                    name: flavor.name,
                    displayedName: this.Kubernetes.formatFlavor(flavor),
                    quotaOverflow: this.getQuotaOverflow(flavor),
                  }))
                .value(),
            }))
          .value();
        return flavors;
      });
  }

  getQuotaOverflow(flavor) {
    // addOverQuotaInfos adds 'disabled' key to flavor parameter
    const testedFlavor = _.clone(flavor);
    this.CloudFlavorService.constructor.addOverQuotaInfos(testedFlavor, this.quotas);
    return _.get(testedFlavor, 'disabled');
  }

  onFlavorFamilyChange(selectedFamily) {
    this.selectedFlavor = null;
    this.flavors = _.find(this.flavorFamilies, family => family.id === selectedFamily.id).flavors;
  }

  addNode() {
    this.loading = true;
    return this.Kubernetes.addNode(this.serviceName, this.selectedFlavor.name)
      .then(() => this.$uibModalInstance.close())
      .catch(error => this.$uibModalInstance.dismiss(this.$translate.instant('kube_nodes_add_error', { message: error })))
      .finally(() => { this.loading = false; });
  }

  instanceIsValid() {
    return _.isNull(this.selectedFlavor.quotaOverflow);
  }

  dismiss(error) {
    this.$uibModalInstance.dismiss(error);
  }
});
