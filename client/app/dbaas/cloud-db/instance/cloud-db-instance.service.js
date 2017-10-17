class CloudDbInstanceService {
    constructor ($filter, $q, $translate, CloudDbTaskService, ControllerHelper, OvhApiCloudDb, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.$translate = $translate;
        this.CloudDbTaskService = CloudDbTaskService;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.ServiceHelper = ServiceHelper;
    }

    addInstance (projectId, data) {
        return this.OvhApiCloudDb.StandardInstance().Lexi().post({ projectId }, data)
            .$promise
            .then(response => {
                this.OvhApiCloudDb.Lexi().resetCache();
                return this.ServiceHelper.successHandler("cloud_db_project_instance_add_success")(response);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_instance_add_error"));
    }

    rebootInstance (projectId, instanceId) {
        return this.OvhApiCloudDb.StandardInstance().Lexi().restart({ projectId, instanceId }, {})
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_project_instance_reboot_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_instance_reboot_error"));
    }

    deleteInstance (projectId, instanceId) {
        return this.OvhApiCloudDb.StandardInstance().Lexi().remove({ projectId, instanceId })
            .$promise
            .then(this.ServiceHelper.successHandler("cloud_db_project_instance_delete_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_instance_delete_error"));
    }

    getInstance (projectId, instanceId, config = {}) {
        if (config.resetCache) {
            this.OvhApiCloudDb.StandardInstance().Lexi().resetCache();
        }

        return this.OvhApiCloudDb.StandardInstance().Lexi().get({ projectId, instanceId })
            .$promise
            .then(response => this.transformInstance(projectId, response));
    }

    getInstances (projectId) {
        /* return this.OvhApiCloudDb.StandardInstance().Erika().query({ projectId })
                .expand()
                .execute({ projectId })
                .$promise
                .then(response => _.map(response, item => this.transformInstance(projectId, item.value)))
                .catch(this.ServiceHelper.errorHandler("cloud_db_project_instance_loading_error"));*/

        return this.OvhApiCloudDb.StandardInstance().Lexi().query({ projectId })
            .$promise
            .then(response => {
                const promises = _.map(response, instanceId => this.getInstance(projectId, instanceId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_project_instance_loading_error"));
    }

    getOom (projectId, instanceId) {
        return this.$q.all({
            instance: this.getInstance(projectId, instanceId),
            ooms: this.OvhApiCloudDb.StandardInstance().Lexi().oom({ projectId, instanceId }).$promise
        })
            .then(response => {
                response.ooms.push({
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-10-04T20:00:01+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-10-04T19:43:45+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-10-04T19:43:01+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-10-04T16:00:02+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-10-01T13:00:03+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-08-14T15:00:04+02:00"
                }, {
                    sizeReached: {
                        unit: "MB",
                        value: 250
                    },
                    date: "2018-04-12T17:00:05+02:00"
                });

                _.forEach(response.ooms, oom => {
                    oom.sizeReached.text = this.$filter("bytes")(oom.sizeReached.value, 0, false, oom.sizeReached.unit);
                });

                response.ooms = _.sortBy(response.ooms, "date");
                for (let i = 0; i < response.ooms.length; i++) {
                    const precedent = i - 1 < 0 ? moment(response.instance.creationDate) : moment(response.ooms[i - 1].date);
                    const current = moment(response.ooms[i].date);
                    const elapsed = moment.duration(current.diff(precedent));
                    response.ooms[i].elapsed = {
                        ms: elapsed.asMilliseconds(),
                        text: elapsed.humanize()
                    };
                }
                return response.ooms;
            });
    }

    transformInstance (projectId, instance) {
        const totalText = this.$filter("bytes")(instance.flavor.disk.value, 0, false, instance.flavor.disk.unit);
        instance.flavor.disk.text = totalText;

        const usedText = this.$filter("bytes")(instance.diskUsed.value, 0, false, instance.diskUsed.unit);
        instance.diskUsed.text = usedText;

        instance.displayName = instance.name || instance.id;

        instance.diskUsage = {
            used: instance.diskUsed,
            total: instance.flavor.disk,
            text: this.$translate.instant("cloud_db_project_instance_usage_text", { used: usedText, total: totalText })
        };

        instance.status = { value: instance.status, text: instance.status };

        instance.flavor.ram.text = this.$filter("bytes")(instance.flavor.ram.value, 0, false, instance.flavor.ram.unit);

        if (instance.taskId) {
            instance.task = { id: instance.taskId };
            return this.CloudDbTaskService.getTask(projectId, instance.taskId, { muteError: true })
                .then(task => {
                    instance.task = task;
                    return instance;
                })
                .catch(error => {
                    if (error.status === 404) {
                        // We tried to fetch a task that no longer exists.  We need to resetCache and update.
                        return this.getInstance(projectId, instance.id, { resetCache: true });
                    }
                    instance.task = { progress: 0 };
                    return this.$q.when(instance);
                });
        }

        instance.task = { progress: 0 };
        return instance;
    }
}

angular.module("managerApp").service("CloudDbInstanceService", CloudDbInstanceService);
