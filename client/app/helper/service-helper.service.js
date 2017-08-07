(() => {
    const defaultSuccessMessage = "common_global_success";
    const defaultErrorMessage = "common_global_error";

    class ServiceHelper {
        constructor ($q, $translate, CloudMessage) {
            this.$q = $q;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
        }


        errorHandler (message) {
            return err => {
                console.error(err);

                if (message) {
                    this.CloudMessage.error(this.$translate.instant(message, err.data));
                } else if (err.message) {
                    this.CloudMessage.error(err.message);
                } else {
                    // Default error message
                    this.CloudMessage.error(this.$translate.instant(defaultErrorMessage));
                }

                return this.$q.reject(err);
            };
        }

        successHandler (message) {
            return data => {
                if (message) {
                    const jsonData = data && data.toJSON ? data.toJSON() : {};
                    this.CloudMessage.success(this.$translate.instant(message, jsonData));
                } else {
                    // Default success message
                    this.CloudMessage.success(this.$translate.instant(defaultSuccessMessage));
                }

                return data;
            };
        }
    }

    angular.module("managerApp").service("ServiceHelper", ServiceHelper);
})();
