class CloudProjectComputeInfrastructureIacDeployCtrl {
    constructor ($q, $state, $stateParams, CloudProjectComputeInfrastructureOpenstackClientService, OvhApiCloudProjectStack, OvhApiMe, ServiceHelper) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;

        this.Service = CloudProjectComputeInfrastructureOpenstackClientService;
        this.OvhApiCloudProjectStack = OvhApiCloudProjectStack;
        this.User = OvhApiMe;
        this.ServiceHelper = ServiceHelper;

        this.StackID = this.$stateParams.stackId;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.getMe();

        // Get guides
        this.OvhApiCloudProjectStack.v6().get({ serviceName: this.serviceName, stackId: this.StackID }).$promise.then(stack => {
            this.stack = stack;
            this.guides = stack.instructions;

            var i;
            for (i = 0; i < this.guides.length; i++) {
              if (this.guides[i].language == this.me.language) {
                  this.guide = this.guides[i];
              }

              // Default is en_US
              if (this.guides[i].language == "en_US") {
                this.defaultGuide = this.guides[i];
              }
            }

            if (this.guide == undefined) {
              this.guide = this.defaultGuide;
            }
        })
        .catch(this.ServiceHelper.errorHandler("cpciiac_view_deployment_ERROR"));

    }

    getMe() {
        this.User.v6().get().$promise.then(me => {
            this.me = me;
        })
        .catch(this.ServiceHelper.errorHandler("cpciiac_view_deployment_ERROR"));
    }

    cancel () {
        this.$state.go("iaas.pci-project.compute.infrastructure.list");
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureIacDeployCtrl", CloudProjectComputeInfrastructureIacDeployCtrl);
