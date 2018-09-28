angular.module('managerApp').controller('KubernetesCtrl', class KubernetesCtrl {
  constructor($stateParams, Kubernetes, KUBERNETES) {
    this.$stateParams = $stateParams;
    this.Kubernetes = Kubernetes;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loading = true;

    this.getCluster();
  }

  getCluster() {
    return this.Kubernetes.getKubernetesCluster(this.serviceName)
      .then((cluster) => { this.cluster = cluster; })
      .catch((error) => {
        this.cluster = { id: this.serviceName, name: this.serviceName };
        this.errorMessage = _.get(error, 'data.message');
      })
      .finally(() => { this.loading = false; });
  }
});
