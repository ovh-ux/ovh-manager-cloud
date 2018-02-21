(() => {
    const defaultSuccessMessage = "common_global_success";
    const defaultErrorMessage = "common_global_error";

    class ServiceHelper {
        constructor ($q, $translate, CloudMessage) {
            this.$q = $q;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
        }


        errorHandler (message, containerName) {
            return err => {
                if (message) {
                    this.CloudMessage.error(this.$translate.instant(message, err.data), containerName);
                } else if (err.message) {
                    this.CloudMessage.error(err.message, containerName);
                } else {
                    // Default error message
                    this.CloudMessage.error(this.$translate.instant(defaultErrorMessage), containerName);
                }

                return this.$q.reject(err);
            };
        }

        successHandler (message, containerName) {
            return data => {
                if (message) {
                    const jsonData = data ? data.toJSON ? data.toJSON() : data : {};
                    this.CloudMessage.success(this.$translate.instant(message, jsonData), containerName);
                } else {
                    // Default success message
                    this.CloudMessage.success(this.$translate.instant(defaultSuccessMessage), containerName);
                }

                return data;
            };
        }
    }

    angular.module("managerApp").service("ServiceHelper", ServiceHelper);
})();
