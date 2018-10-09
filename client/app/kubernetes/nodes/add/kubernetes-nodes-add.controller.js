angular.module('managerApp').controller('KubernetesNodesAddCtrl', class KubernetesNodesAddCtrl {
  constructor(
    $stateParams, $translate, $uibModalInstance,
    Kubernetes, projectId,
    CLOUD_FLAVORTYPE_CATEGORY, KUBERNETES,
  ) {
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.$uibModalInstance = $uibModalInstance;
    this.Kubernetes = Kubernetes;
    this.projectId = projectId;
    this.CLOUD_FLAVORTYPE_CATEGORY = CLOUD_FLAVORTYPE_CATEGORY;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loading = true;
    this.serviceName = this.$stateParams.serviceName;

    this.getFlavors();
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
                  }))
                .value(),
            }))
          .value();
        return flavors;
      })
      .catch(error => this.$uibModalInstance.dismiss(this.$translate.instant('kube_nodes_add_flavor_error', { message: error })))
      .finally(() => { this.loading = false; });
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

  dismiss(error) {
    this.$uibModalInstance.dismiss(error);
  }
});
