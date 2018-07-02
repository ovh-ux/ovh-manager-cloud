class CloudProjectComputeInfrastructureIacDeployCtrl {
  constructor($q, $state, $stateParams, CloudProjectComputeInfrastructureOpenstackClientService,
    OvhApiCloudProjectStack, OvhApiMe, ServiceHelper) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;

    this.Service = CloudProjectComputeInfrastructureOpenstackClientService;
    this.OvhApiCloudProjectStack = OvhApiCloudProjectStack;
    this.User = OvhApiMe;
    this.ServiceHelper = ServiceHelper;

    this.StackID = this.$stateParams.stackId;
  }

  $onInit() {
    this.serviceName = this.$stateParams.projectId;
    this.getMe();
    // Get guides
    this.OvhApiCloudProjectStack.v6()
      .get({ serviceName: this.serviceName, stackId: this.StackID }).$promise
      .then((stack) => {
        this.stack = stack;
        this.guides = stack.instructions;
        this.guide = _.find(this.guides, guide => guide.language === this.me.language);
        // Default is en_US
        if (!this.guide) {
          this.guide = _.find(this.guides, guide => guide.language === 'en_US');
        }
        if (!this.guide) {
          this.guide = this.defaultGuide;
        }
        if (this.$stateParams.hTerm.session) {
          return this.$q.when();
        }
        return this.OvhApiCloudProjectStack.v6()
          .client({ serviceName: this.serviceName, stackId: stack.uuid }).$promise
          .then(session => this.$state.go('.', {
            hTerm: {
              session,
            },
          }));
      })
      .catch(this.ServiceHelper.errorHandler('cpciiac_view_deployment_ERROR'));
  }

  getMe() {
    this.User.v6().get().$promise.then((me) => {
      this.me = me;
    })
      .catch(this.ServiceHelper.errorHandler('cpciiac_view_deployment_ERROR'));
  }

  cancel() {
    this.$state.go('iaas.pci-project.compute.infrastructure.list');
  }
}

angular.module('managerApp').controller('CloudProjectComputeInfrastructureIacDeployCtrl', CloudProjectComputeInfrastructureIacDeployCtrl);
