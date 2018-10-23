angular.module('managerApp')
  .controller('CloudProjectComputeTasksCreateCtrl', class CloudProjectComputeTasksCreateCtrl {
    constructor(
      $state, $stateParams, $translate,
      CloudMessage, CloudProjectCompute, OvhApiCloudProjectInstance, OvhApiMe,
      validator,
      CPC_TASKS, URLS,
    ) {
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.CloudMessage = CloudMessage;
      this.CloudProjectCompute = CloudProjectCompute;
      this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
      this.OvhApiMe = OvhApiMe;
      this.validator = validator;
      this.CPC_TASKS = CPC_TASKS;
      this.URLS = URLS;
    }

    $onInit() {
      this.serviceName = this.$stateParams.projectId;
      this.instanceId = this.$stateParams.instanceId;
      this.instancesAreLoading = true;

      this.model = {
        action: null,
        instance: null,
        schedule: null,
      };

      this.getRegionsWithWorkflowService()
        .then(() => this.getCloudProjectEligibleInstances())
        .catch(() => {
          this.CloudMessage.error(this.$translate.instant('cpc_tasks_resources_error'));
        })
        .finally(() => { this.instancesAreLoading = false; });
    }

    getRegionsWithWorkflowService() {
      return this.CloudProjectCompute.getRegionsWithWorkflowService(this.serviceName)
        .then((regions) => {
          this.regions = regions;
        });
    }

    getCloudProjectEligibleInstances() {
      return this.CloudProjectCompute.getInstances(this.serviceName)
        .then((instances) => {
          this.instances = _.filter(
            instances,
            instance => _.includes(this.regions, instance.region),
          );
          if (this.instanceId) {
            this.model.instance = _.find(instances, { id: this.instanceId });
          }
        });
    }

    getSubsidiary() {
      return this.OvhApiMe.v6().get().$promise
        .then(({ ovhSubsidiary }) => {
          this.priceUrl = this.URLS.website_order.pcs[ovhSubsidiary];
        });
    }

    isActionSelected() {
      return !_.isNull(this.model.action);
    }

    isInstanceSelected() {
      return !_.isNull(this.model.instance);
    }

    isScheduleSelected() {
      return !_.isNull(this.model.schedule);
    }

    loadTasks() {
      return this[`load${this.model.action.id}Tasks`]();
    }

    loadsnapshotTasks() {
      return this.CloudProjectCompute
        .getWorkflowBackup(this.serviceName, this.model.instance.region)
        .then((backups) => {
          this.existingTasksNames = _.map(backups, 'name');
        });
    }

    isNameValid(taskName) {
      if (this.existingTasksNames) {
        return !this.existingTasksNames.find(name => name === taskName);
      }

      return false;
    }

    createTask() {
      this.createLoader = true;
      return this[`create${this.model.action.id}Task`]()
        .then(() => {
          this.createLoader = false;
        });
    }

    selectSchedule(schedule) {
      if (schedule === 'custom') {
        this.isCustomSchedule = true;
      } else {
        this.model.rotation = _.get(this.CPC_TASKS, `defaultSchedules.${schedule}.rotation`);
        this.isCustomSchedule = false;
      }
    }

    selectTime() {
      const time = moment(this.model.time).utc();
      this.model.cron = `${time.minutes()} ${time.hours()} * * *`;
    }

    createsnapshotTask() {
      return this.CloudProjectCompute
        .createWorkflowBackup(this.serviceName, this.model.instance.region, {
          cron: this.model.cron,
          instanceId: this.model.instance.id,
          name: this.model.name,
          rotation: this.model.rotation,
        })
        .then(() => this.goToTasksList())
        .catch((error) => {
          this.CloudMessage.error(this.$translate.instant('cpc_tasks_create_error', { message: _.get(error, 'data.message', '') }));
        });
    }

    goToTasksList() {
      this.$state.go('iaas.pci-project.compute.task');
    }
  });
