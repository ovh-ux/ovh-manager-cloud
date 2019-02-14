angular.module('managerApp').controller('KubernetesNodesCtrl', class KubernetesNodesCtrl {
  constructor(
    $q, $state, $stateParams, $timeout, $translate, $uibModal,
    CucCloudMessage, Kubernetes,
    KUBERNETES,
  ) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.CucCloudMessage = CucCloudMessage;
    this.Kubernetes = Kubernetes;
    this.KUBERNETES = KUBERNETES;
  }

  $onInit() {
    this.loading = false;

    this.getPublicCloudProject()
      .then(() => this.getInfo())
      .then(() => this.loadMessages());
  }

  loadMessages() {
    this.CucCloudMessage.unSubscribe('paas.kube.nodes');
    this.messageHandler = this.CucCloudMessage.subscribe('paas.kube.nodes', { onMessage: () => this.refreshMessages() });
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  getCluster() {
    return this.Kubernetes.getKubernetesCluster(this.serviceName)
      .then((cluster) => { this.cluster = cluster; })
      .catch((error) => {
        this.cluster = { id: this.serviceName, name: this.serviceName };
        this.CucCloudMessage.error(this.$translate.instant('kube_error', { message: _.get(error, 'data.message') }));
      });
  }

  getInfo() {
    this.loading = true;
    return this.$q.all(
      this.getNodes(),
      this.getCluster(),
    ).finally(() => { this.loading = false; });
  }

  getNodes() {
    return this.Kubernetes.getNodes(this.serviceName)
      .then((nodes) => { this.nodes = nodes; })
      .catch(() => this.CucCloudMessage.error(this.$translate.instant('kube_nodes_error')));
  }

  getAssociatedFlavor(node) {
    if (node.instanceId) {
      return this.Kubernetes.getAssociatedInstance(node.projectId, node.instanceId)
        .then(instance => _.set(node, 'formattedFlavor', this.Kubernetes.formatFlavor(instance.flavor)))
        .catch(() => {
          _.set(node, 'formattedFlavor', this.$translate.instant('kube_nodes_flavor_error'));
        });
    }

    return this.$q.when(_.set(node, 'formattedFlavor', node.flavor));
  }

  getPublicCloudProject() {
    return this.Kubernetes.getAssociatedPublicCloudProjects(this.serviceName)
      .then(projects => this.Kubernetes.getProject(_.first(projects).projectId))
      .then((project) => {
        this.project = project;
      })
      .catch(() => {
        this.CucCloudMessage.error(this.$translate.instant('kube_nodes_project_error'));
      });
  }

  confirmNodeDeletion(nodeId) {
    return this.$uibModal.open({
      templateUrl: 'app/kubernetes/nodes/delete/kubernetes-nodes-delete.html',
      controller: 'KubernetesNodesDeleteCtrl',
      controllerAs: '$ctrl',
      backdrop: 'static',
      resolve: {
        nodeId() {
          return nodeId;
        },
      },
    }).result
      .then(() => {
        this.displaySuccessMessage('kube_nodes_delete_success');
        return this.refreshNodes();
      })
      .catch((error) => {
        if (error) {
          this.CucCloudMessage.error(this.$translate.instant('kube_nodes_delete_error', { message: error }));
        }
      });
  }

  openAddNodeForm(projectId) {
    return this.$uibModal.open({
      templateUrl: 'app/kubernetes/nodes/add/kubernetes-nodes-add.html',
      controller: 'KubernetesNodesAddCtrl',
      controllerAs: '$ctrl',
      backdrop: 'static',
      resolve: {
        projectId() {
          return projectId;
        },
      },
    }).result
      .then(() => {
        this.displaySuccessMessage('kube_nodes_add_success');
        return this.refreshNodes();
      })
      .catch((error) => {
        if (error) {
          this.CucCloudMessage.error(error);
        }
      });
  }

  displaySuccessMessage(message) {
    this.CucCloudMessage.success(this.$translate.instant(message));
    this.$timeout(() => this.CucCloudMessage.flushMessages(), 3000);
  }

  refreshNodes() {
    this.Kubernetes.resetClusterCache();
    this.Kubernetes.resetNodesCache();
    return this.getInfo();
  }
});
