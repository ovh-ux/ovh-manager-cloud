class CloudProjectComputeInfrastructureIacViewCtrl {
    constructor ($q, $state, $stateParams, OvhApiCloudProjectStack, ServiceHelper) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;

        this.ServiceHelper = ServiceHelper;
        this.OvhApiCloudProjectStack = OvhApiCloudProjectStack;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.getStacks();
    }

    cancel () {
        this.$state.go("iaas.pci-project.compute.infrastructure.list");
    }

    /* Get stacks from API */
    getStacks () {
        return this.$q.all({
            stacks: this.OvhApiCloudProjectStack.v6().query({ serviceName: this.serviceName }).$promise
        })
        .then(({ stacks }) => {
            this.stacks = stacks;
        })
        .catch(this.ServiceHelper.errorHandler("cpciiac_view_general_ERROR"));
    }

    deployStack(stack) {
      const actions = {};
      _.forEach(_.get(stack, "commands"), action => {
          if (action.name && action.command) {
              actions[action.name] = action.command;
          }
      });

      return this.OvhApiCloudProjectStack.v6().client({ serviceName: this.serviceName, stackId: stack.uuid }).$promise
          .then(session => {
              this.$state.go("iaas.pci-project.compute.infrastructure.iac-deploy", {
                  hTerm: {
                      session,
                      actions
                      //region: _.get(this.model, "region.microRegion.code")
                  },
                  stackId: stack.uuid
              });
          })
          .catch(this.ServiceHelper.errorHandler("cpciiac_view_deployment_ERROR"));
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureIacViewCtrl", CloudProjectComputeInfrastructureIacViewCtrl);
