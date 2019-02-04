angular.module('managerApp').service('Kubernetes', class Kubernetes {
  constructor(
    $q, $translate,
    OvhApiCloudProject, OvhApiCloudProjectFlavor, OvhApiCloudProjectInstance,
    OvhApiKube, OvhApiCloudProjectQuota, SidebarMenu,
    KUBERNETES,
  ) {
    this.$q = $q;
    this.$translate = $translate;
    this.OvhApiCloudProject = OvhApiCloudProject;
    this.OvhApiCloudProjectFlavor = OvhApiCloudProjectFlavor;
    this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
    this.OvhApiKube = OvhApiKube;
    this.OvhApiCloudProjectQuota = OvhApiCloudProjectQuota;
    this.SidebarMenu = SidebarMenu;
    this.KUBERNETES = KUBERNETES;
  }

  getKubernetesCluster(serviceName) {
    return this.OvhApiKube.v6().get({ serviceName }).$promise;
  }

  getKubernetesServiceInfos(serviceName) {
    return this.OvhApiKube.v6().getServiceInfos({ serviceName }).$promise;
  }

  getKubernetesConfig(serviceName) {
    return this.OvhApiKube.v6().getKubeConfig({ serviceName }).$promise;
  }

  getAssociatedPublicCloudProjects(serviceName) {
    return this.OvhApiKube.PublicCloud().Project().v6().query({ serviceName }).$promise;
  }

  getAssociatedInstance(projectId, instanceId) {
    return this.OvhApiCloudProjectInstance
      .v6()
      .get({ serviceName: projectId, instanceId })
      .$promise;
  }

  getProject(projectId) {
    return this.OvhApiCloudProject.v6().get({ serviceName: projectId }).$promise;
  }

  getProjectQuota(serviceName) {
    return this.OvhApiCloudProjectQuota
      .v6()
      .query({ serviceName })
      .$promise;
  }

  getNodes(serviceName) {
    return this.OvhApiKube.PublicCloud().Node().v6().query({ serviceName }).$promise;
  }

  addNode(serviceName, flavorName) {
    return this.OvhApiKube.PublicCloud().Node().v6().save({ serviceName }, { flavorName }).$promise;
  }

  changeMenuTitle(serviceName, name) {
    const menuItem = this.SidebarMenu.getItemById(serviceName);
    if (menuItem) {
      menuItem.title = name;
    }
  }

  deleteNode(serviceName, nodeId) {
    return this.OvhApiKube.PublicCloud().Node().v6().delete({ serviceName, nodeId }).$promise;
  }

  resetNodesCache() {
    this.OvhApiKube.PublicCloud().Node().v6().resetCache();
    this.OvhApiKube.PublicCloud().Node().v6().resetQueryCache();
  }

  getFlavors(serviceName) {
    // Region is constant for now
    return this.OvhApiCloudProjectFlavor
      .v6()
      .query({ serviceName, region: this.KUBERNETES.region })
      .$promise;
  }

  getFlavorDetails(serviceName, flavorId) {
    return this.OvhApiCloudProjectFlavor.get({ serviceName, flavorId }).$promise;
  }

  formatFlavor(flavor) {
    return this.$translate.instant('kube_flavor', {
      name: flavor.name.toUpperCase(),
      cpuNumber: flavor.vcpus,
      ramCapacity: flavor.ram / 1000,
      diskCapacity: flavor.disk,
    });
  }

  resetCluster(serviceName, workerNodesPolicy) {
    return this.OvhApiKube.v6().reset({ serviceName }, { workerNodesPolicy }).$promise;
  }

  resetClusterCache() {
    this.OvhApiKube.v6().resetCache();
  }

  updateKubernetes(serviceName, kubernetes) {
    return this.OvhApiKube.v6().update({ serviceName }, { name: kubernetes.name }).$promise
      .then((res) => {
        this.changeMenuTitle(serviceName, kubernetes.name);
        return res;
      });
  }
});
