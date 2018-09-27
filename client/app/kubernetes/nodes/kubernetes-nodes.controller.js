angular.module("managerApp").controller("KubernetesNodesCtrl", class KubernetesNodesCtrl {

    constructor ($stateParams, $timeout, $translate, $uibModal, CloudMessage, Kubernetes, KUBERNETES) {
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.$uibModal = $uibModal;
        this.CloudMessage = CloudMessage;
        this.Kubernetes = Kubernetes;
        this.KUBERNETES = KUBERNETES;
    }

    $onInit () {
        this.loading = false;

        this.getPublicCloudProject()
            .then(() => this.getNodes());
        this.loadMessages();
    }

    loadMessages () {
        this.CloudMessage.unSubscribe("paas.kube.nodes");
        this.messageHandler = this.CloudMessage.subscribe("paas.kube.nodes", { onMessage: () => this.refreshMessages() });
    }

    refreshMessages () {
        this.messages = this.messageHandler.getMessages();
    }

    getNodes () {
        this.loading = true;
        return this.Kubernetes.getNodes(this.serviceName)
            .then(nodes => { this.nodes = nodes; })
            .catch(() => this.CloudMessage.error(this.$translate.instant("kube_nodes_error")))
            .finally(() => { this.loading = false; });
    }

    getAssociatedFlavor (node) {
        return this.Kubernetes.getAssociatedInstance(node.projectId, node.instanceId)
            .then(instance => _.set(node, "formattedFlavor", this.Kubernetes.formatFlavor(instance.flavor)))
            .catch(() => {
                _.set(node, "formattedFlavor", this.$translate.instant("kube_nodes_flavor_error"));
            });
    }

    getPublicCloudProject () {
        return this.Kubernetes.getAssociatedPublicCloudProjects(this.serviceName)
            .then(projects => this.Kubernetes.getProject(_.first(projects).projectId))
            .then(project => {
                console.log(project);
                this.project = project;
            })
            .catch(() => {
                this.CloudMessage.error(this.$translate.instant("kube_nodes_project_error"));
            });
    }

    confirmNodeDeletion (nodeId) {
        return this.$uibModal.open({
            templateUrl: "app/kubernetes/nodes/delete/kubernetes-nodes-delete.html",
            controller: "KubernetesNodesDeleteCtrl",
            controllerAs: "$ctrl",
            backdrop: "static",
            resolve: {
                nodeId () {
                    return nodeId;
                }
            }
        }).result
            .then(() => {
                this.displaySuccessMessage("kube_nodes_delete_success");
                this.Kubernetes.resetNodesCache();
                return this.getNodes();
            })
            .catch(error => {
                if (error) {
                    this.CloudMessage.error(this.$translate.instant("kube_nodes_delete_error", { message: error }));
                }
            });
    }

    openAddNodeForm (projectId) {
        return this.$uibModal.open({
            templateUrl: "app/kubernetes/nodes/add/kubernetes-nodes-add.html",
            controller: "KubernetesNodesAddCtrl",
            controllerAs: "$ctrl",
            backdrop: "static",
            resolve: {
                projectId () {
                    return projectId;
                }
            }
        }).result
            .then(() => {
                this.displaySuccessMessage("kube_nodes_add_success");
                this.Kubernetes.resetNodesCache();
                return this.getNodes();

            })
            .catch(error => {
                if (error) {
                    this.CloudMessage.error(error);
                }
            });
    }

    displaySuccessMessage (message) {
        this.CloudMessage.success(this.$translate.instant(message));
        this.$timeout(() => this.CloudMessage.flushMessages(), 3000);
    }
});
