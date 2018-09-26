angular.module("managerApp").controller("KubernetesCtrl", class KubernetesCtrl {
    constructor ($stateParams, Kubernetes) {
        this.$stateParams = $stateParams;
        this.Kubernetes = Kubernetes;
    }

    $onInit () {
        this.loading = true;
        this.serviceName = this.$stateParams.serviceName;

        this.getCluster();
    }

    getCluster () {
        return this.Kubernetes.getKubernetesCluster(this.serviceName)
            .then(cluster => { this.cluster = cluster; })
            .catch(() => (this.cluster = { id: this.serviceName, name: this.serviceName }))
            .finally(() => { this.loading = false; });
    }
});
