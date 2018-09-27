angular.module("managerApp").controller("KubernetesServiceCtrl", class KubernetesServiceCtrl {

    constructor ($stateParams, $translate, CloudMessage, ControllerHelper, Kubernetes, KUBERNETES) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.Kubernetes = Kubernetes;
        this.KUBERNETES = KUBERNETES;
    }

    $onInit () {
        this.loaders = {
            cluster: false,
            billing: false
        };

        this.getClusterInfos();
        this.getBillingInfos();
        this.getConfigFile();
        this.loadMessages();
    }


    loadMessages () {
        this.CloudMessage.unSubscribe("paas.kube.service");
        this.messageHandler = this.CloudMessage.subscribe("paas.kube.service", { onMessage: () => this.refreshMessages() });
    }

    refreshMessages () {
        this.messages = this.messageHandler.getMessages();
    }

    getClusterInfos () {
        this.loaders.cluster = true;
        return this.Kubernetes.getKubernetesCluster(this.serviceName)
            .then(cluster => {
                this.cluster = cluster;
                _.set(this.cluster, "region", this.KUBERNETES.region);
            })
            .catch(() => { this.displayError = true; })
            .finally(() => { this.loaders.cluster = false; });
    }

    getBillingInfos () {
        this.loaders.billing = true;
        return this.Kubernetes.getKubernetesServiceInfos(this.serviceName)
            .then(serviceInfos => {
                this.serviceInfos = serviceInfos;
                // Static for now
                _.set(this.serviceInfos, "offer", this.$translate.instant("kube_service_offer_beta"));
            })
            .catch(() => { this.displayError = true; })
            .finally(() => { this.loaders.billing = false; });
    }

    getConfigFile () {
        this.loaders.config = true;
        return this.Kubernetes.getKubernetesConfig(this.serviceName)
            .then(fileConfig => {
                this.kubernetesConfig = {
                    content: fileConfig.content,
                    fileName: this.KUBERNETES.kubeconfigFileName
                };
            })
            .catch(() => {
                this.CloudMessage.error(this.$translate.instant("kube_service_file_error"));
            })
            .finally(() => {
                this.loaders.config = false;
            });
    }

    downloadConfigFile () {
        // Set yml extension manually as there is no MIME type yet
        this.ControllerHelper.downloadContent({ content: this.kubernetesConfig.content, fileName: `${this.kubernetesConfig.fileName}.yml` });
    }

});
