angular.module('managerApp').controller('KubernetesServiceCtrl', class KubernetesServiceCtrl {
  constructor($scope, $state, $stateParams, $translate, CloudMessage, ControllerHelper,
    Kubernetes, KUBERNETES) {
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.CloudMessage = CloudMessage;
    this.ControllerHelper = ControllerHelper;
    this.Kubernetes = Kubernetes;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loaders = {
      cluster: true,
      billing: true,
      config: true,
    };

    this.$scope.$on('kube.service.refresh', () => this.getClusterInfos());

    this.getClusterInfos()
      .then(() => this.getConfigFile())
      .then(() => this.getBillingInfos())
      .then(() => this.loadMessages());
  }

  changeClusterName() {
    this.$state.go('paas.kube.service.rename', {
      serviceName: this.serviceName,
    });
  }

  loadMessages() {
    this.CloudMessage.unSubscribe('paas.kube.service');
    this.messageHandler = this.CloudMessage.subscribe('paas.kube.service', { onMessage: () => this.refreshMessages() });
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  getClusterInfos() {
    return this.Kubernetes.getKubernetesCluster(this.serviceName)
      .then((cluster) => {
        this.cluster = cluster;
        _.set(this.cluster, 'region', this.KUBERNETES.region);
      })
      .catch(() => { this.displayError = true; })
      .finally(() => { this.loaders.cluster = false; });
  }

  getBillingInfos() {
    return this.Kubernetes.getKubernetesServiceInfos(this.serviceName)
      .then((serviceInfos) => {
        this.serviceInfos = serviceInfos;
        // Static for now
        _.set(this.serviceInfos, 'offer', this.$translate.instant('kube_service_offer_beta'));
      })
      .catch(() => { this.displayError = true; })
      .finally(() => { this.loaders.billing = false; });
  }

  getConfigFile() {
    return this.Kubernetes.getKubernetesConfig(this.serviceName)
      .then((fileConfig) => {
        this.kubernetesConfig = {
          content: fileConfig.content,
          fileName: this.KUBERNETES.kubeconfigFileName,
        };
      })
      .catch(() => {
        this.CloudMessage.error(this.$translate.instant('kube_service_file_error'));
      })
      .finally(() => {
        this.loaders.config = false;
      });
  }

  downloadConfigFile() {
    // Set yml extension manually as there is no MIME type yet
    this.ControllerHelper.constructor.downloadContent({ fileContent: this.kubernetesConfig.content, fileName: `${this.kubernetesConfig.fileName}.yml` });
  }

  resetCluster() {
    return this.$state.go('paas.kube.service.reset', {
      cluster: this.cluster,
    });
  }
});
