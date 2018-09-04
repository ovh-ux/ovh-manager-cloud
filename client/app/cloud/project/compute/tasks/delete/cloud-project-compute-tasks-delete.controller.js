angular.module('managerApp')
  .controller('CloudProjectComputeTasksDeleteCtrl', class CloudProjectComputeTasksDeleteCtrl {
    constructor($translate, $uibModalInstance, CloudMessage, CloudProjectCompute, params) {
      this.$translate = $translate;
      this.$uibModalInstance = $uibModalInstance;
      this.CloudMessage = CloudMessage;
      this.CloudProjectCompute = CloudProjectCompute;
      this.params = params;
    }

    $onInit() {
      this.projectId = this.params.projectId;
      this.regionName = this.params.region;
      this.backupId = this.params.backupId;
      this.backupName = this.params.backupName;
    }

    getDeletionService() {
      return this.CloudProjectCompute
        .deleteWorkflowBackup(this.projectId, this.regionName, this.backupId);
    }

    deleteAutomatedBackup() {
      this.isLoading = true;
      return this.getDeletionService()
        .then(() => {
          this.CloudMessage.info(this.$translate.instant('cpc_tasks_delete_success', { name: this.backupName }));
          this.$uibModalInstance.close();
        })
        .catch(() => {
          this.CloudMessage.error(this.$translate.instant('cpc_tasks_delete_error'));
          this.dismiss();
        });
    }

    dismiss() {
      this.$uibModalInstance.dismiss();
    }
  });
