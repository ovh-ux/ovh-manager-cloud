angular.module('managerApp')
  .controller('CloudProjectComputeTasksOnboardingCtrl', class CloudProjectComputeTasksOnboardingCtrl {
    constructor(
      $state, $stateParams, $translate,
      CloudMessage, CloudProjectCompute, CloudUserPref,
      CPC_TASKS,
    ) {
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.CloudMessage = CloudMessage;
      this.CloudProjectCompute = CloudProjectCompute;
      this.CloudUserPref = CloudUserPref;
      this.CPC_TASKS = CPC_TASKS;
    }

    $onInit() {
      this.projectId = this.$stateParams.projectId;
    }


    discardOnboarding() {
      this.updateOnboardingStatus()
        .then(() => {
          this.$state.go('iaas.pci-project.compute');
        });
    }

    goToTasks() {
      this.updateOnboardingStatus()
        .then(() => {
          this.$state.go('iaas.pci-project.compute.task');
        });
    }

    updateOnboardingStatus() {
      return this.CloudUserPref.set(this.CPC_TASKS.onboardingKey, { done: true });
    }
  });
