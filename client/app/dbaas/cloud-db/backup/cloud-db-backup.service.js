class CloudDbBackupService {
    constructor ($filter, $q, CloudDbDatabaseService, CloudDbTaskService, OvhApiCloudDb, OvhApiCloudDbStdInstanceDatabase, ServiceHelper) {
        this.$filter = $filter;
        this.$q = $q;
        this.CloudDbDatabaseService = CloudDbDatabaseService;
        this.CloudDbTaskService = CloudDbTaskService;
        this.OvhApiCloudDb = OvhApiCloudDb;
        this.OvhApiCloudDbStdInstanceDatabase = OvhApiCloudDbStdInstanceDatabase;
        this.ServiceHelper = ServiceHelper;
    }

    addBackup (projectId, instanceId, databaseId, data) {
        return this.OvhApiCloudDbStdInstanceDatabase.Lexi().createDump({ projectId, instanceId, databaseId }, data)
            .$promise
            .then(this.ServiceHelper.errorHandler("cloud_db_backup_add_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_backup_add_error"));
    }

    restoreBackup (projectId, instanceId, dumpId) {
        //cloud_db_backup_restore_sucess
        return this.ServiceHelper.errorHandler("cloud_db_backup_restore_error")({});
    }

    deleteBackup (projectId, instanceId, dumpId) {
        return this.OvhApiCloudDb.Dump().Lexi().delete({ projectId, dumpId })
            .$promise
            .then(this.ServiceHelper.errorHandler("cloud_db_backup_delete_success"))
            .catch(this.ServiceHelper.errorHandler("cloud_db_backup_delete_error"));
    }

    getBackup (projectId, instanceId, dumpId, config = {}) {
        if (config.resetCache) {
            this.OvhApiCloudDb.Dump().Lexi().resetCache();
        }

        return this.OvhApiCloudDb.Dump().Lexi().get({ projectId, dumpId })
            .$promise
            .then(response => {
                response.displayName = response.name;
                response.size.text = this.$filter("bytes")(response.size.value, 0, false, response.size.unit.replace("byte", "B"));

                return this.$q.all({
                    backup: this.$q.when(response),
                    task: response.taskId ? this.CloudDbTaskService.getTask(projectId, response.taskId, { muteError: true }) : this.$q.when({ progress: 0 }),
                    database: this.CloudDbDatabaseService
                        .getDatabase(projectId, instanceId, response.databaseName, { muteError: true })
                        .catch(() => this.$q.when({ displayName: response.displayName }))
                });
            })
            .then(additionnalInfo => {
                additionnalInfo.backup.task = additionnalInfo.task;
                additionnalInfo.backup.database = additionnalInfo.database;
                return additionnalInfo.backup;
            })
            .catch(error => {
                if (!config.muteError) {
                    return this.ServiceHelper.errorHandler("cloud_db_backup_loading_error")(error);
                }

                return this.$q.reject(error);
            });
    }

    getBackups (projectId, instanceId) {
        return this.OvhApiCloudDb.Dump().Lexi().query({ projectId }, { instanceId })
            .$promise
            .then(response => {
                const promises = _.map(response, backupId => this.getBackup(projectId, instanceId, backupId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("cloud_db_backup_list_loading_error"));
    }
}

angular.module("managerApp").service("CloudDbBackupService", CloudDbBackupService);
