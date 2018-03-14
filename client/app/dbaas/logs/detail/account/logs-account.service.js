class LogsAccountService {
    constructor (OvhApiDbaas, LogsHelperService) {
        this.UserAapiService = OvhApiDbaas.User().Lexi();
        this.LogsHelperService = LogsHelperService;
    }

    changePassword (serviceName, newPassword) {
        return this.UserAapiService.changePassword({ serviceName }, newPassword)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_password_change_success", {});
            })
            .catch(err => this.LogsHelperService.handleError("logs_password_change_error", err, {}));
    }

    updateUser (serviceName, user) {
        return this.UserAapiService.updateUser({ serviceName }, user)
            .$promise
            .then(operation => {
                this._resetAllCache();
                return this.LogsHelperService.handleOperation(serviceName, operation.data || operation, "logs_user_update_success", {});
            })
            .catch(err => this.LogsHelperService.handleError("logs_user_update_error", err, {}));
    }

    _resetAllCache () {
        this.UserAapiService.resetAllCache();
    }

}

angular.module("managerApp").service("LogsAccountService", LogsAccountService);
