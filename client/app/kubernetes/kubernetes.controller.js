angular.module("managerApp").controller("KubernetesCtrl", class KubernetesCtrl {
    constructor ($stateParams, Kubernetes) {
        this.$stateParams = $stateParams;
        this.Kubernetes = Kubernetes;
    }

    $onInit () {
        this.loading = true;

        this.getCluster();
    }

    getCluster () {
        return this.Kubernetes.getKubernetesCluster(this.serviceName)
            .then(cluster => { this.cluster = cluster; })
            .catch(error => {
                this.cluster = { id: this.serviceName, name: this.serviceName };
                this.errorMessage = _.get(error, "data.message");
            })
            .finally(() => { this.loading = false; });
    }
});
