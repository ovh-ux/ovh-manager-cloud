angular.module('managerApp')
  .controller('CloudProjectComputeTasksOnboardingCtrl', class CloudProjectComputeTasksOnboardingCtrl {
    constructor(
      $q, $state, $stateParams, $translate,
      CloudMessage, CloudProjectCompute, CloudUserPref,
      CPC_TASKS,
    ) {
      this.$q = $q;
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

      this.loading = true;

      this.CloudProjectCompute.getRegionsWithWorkflowService(this.projectId)
        .then(regions => this.$q.all(
          regions.map(
            region => this.CloudProjectCompute.getWorkflowBackup(this.projectId, region),
          ),
        ))
        .then((backups) => {
          if (!_(backups).flatten().isEmpty()) {
            this.discardOnboarding();
          }
        })
        .finally(() => { this.loading = false; });
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
      return this.CloudUserPref.set(`${this.CPC_TASKS.onboardingKey}_${this.projectId}`, { done: true });
    }
  });
