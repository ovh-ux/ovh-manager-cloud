angular.module("managerApp").controller("KubernetesNodesAddCtrl", class KubernetesNodesAddCtrl {

    constructor ($scope, $q, $stateParams, $translate, $uibModalInstance, Kubernetes, projectId, CLOUD_FLAVORTYPE_CATEGORY) {
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.Kubernetes = Kubernetes;
        this.projectId = projectId;
        this.CLOUD_FLAVORTYPE_CATEGORY = CLOUD_FLAVORTYPE_CATEGORY;
    }

    $onInit () {
        this.loading = true;
        this.serviceName = this.$stateParams.serviceName;

        this.flavors = [];
        this.flavorIds = _.map(this.CLOUD_FLAVORTYPE_CATEGORY, "id");
        this.flavorFamilies = _.map(this.flavorIds, flavorId => ({ id: flavorId, familyName: this.$translate.instant(`kube_nodes_add_flavor_family_${flavorId}`) }));
        this.flavorsByFamily = _.zipObject(this.flavorIds, _.times(this.flavorFamilies.length, () => []));

        this.getFlavors();
    }

    getFlavors () {
        return this.Kubernetes.getFlavors(this.projectId)
            .then(flavors => _.forEach(flavors, flavor => {
                const family = _.find(this.CLOUD_FLAVORTYPE_CATEGORY, flavorType => _.includes(flavorType.types, flavor.type));
                this.flavorsByFamily[family.id].push({ name: flavor.name, displayedName: this.Kubernetes.formatFlavor(flavor) });
            }))
            .finally(() => { this.loading = false; });

    }

    onFlavorFamilyChange (selectedFamily) {
        this.flavor = null;
        this.flavors = this.flavorsByFamily[selectedFamily.id];
    }

    addNode () {
        this.loading = true;
        return this.Kubernetes.addNode(this.serviceName, this.flavor.name)
            .then(() => this.$uibModalInstance.close())
            .catch(error => this.$uibModalInstance.dismiss(_.get(error, "data.message")))
            .finally(() => { this.loading = false; });
    }

    dismiss (error) {
        this.$uibModalInstance.dismiss(error);
    }
});
