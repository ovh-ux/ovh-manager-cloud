(() => {
    class VeeamEnterpriseService {
        constructor ($q, $translate, OvhApiVeeamEnterprise) {
            this.$q = $q;
            this.$translate = $translate;
            this.veeamEnterprise = OvhApiVeeamEnterprise.v6();

            this.unitOfWork = { };
            this.unitOfWork.init = () => {
                this.unitOfWork.messages = [];
            };
        }

        getConfigurationInfos (serviceName) {
            return this.veeamEnterprise
                .get({ serviceName })
                .$promise
                .then(response => this.acceptResponse(response))
                .catch(response =>
                    this.rejectResponse(
                        response,
                        this.$translate.instant("veeam_enterprise_infos_configuration_load_error")
                    )
                );
        }

        getSubscriptionInfos (serviceName) {
            return this.veeamEnterprise
                .getServiceInfos({ serviceName })
                .$promise
                .then(response => this.acceptResponse(response))
                .catch(response =>
                    this.rejectResponse(
                        response.data,
                        this.$translate.instant("veeam_enterprise_infos_subscription_load_error")
                    )
                );
        }

        acceptResponse (data, message) {
            return this.$q.resolve({
                status: "OK",
                data,
                message
            });
        }

        rejectResponse (data, message) {
            return this.$q.reject({
                status: "ERROR",
                data,
                message
            });
        }
    }

    angular.module("managerApp").service("VeeamEnterpriseService", VeeamEnterpriseService);
})();
