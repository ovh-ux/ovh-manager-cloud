class VpsReverseDnsCtrl {
    constructor ($translate, $uibModalInstance, CloudMessage, serviceName, VpsService) {
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.VpsService = VpsService;

        this.loader = {
            init: false,
            save: false
        };

        this.ips = [];
        this.structuredData = {
            results: []
        };
        this.model = {
            value: null,
            reverse: null
        };
    }

    $onInit () {
        this.loader.init = true;
        this.VpsService.getIps(this.serviceName)
            .then(data => { this.ips = data.results })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reversedns_fail")))
            .finally(() => { this.loader.init = false });
    }

    prepareDnsIpsStruct ()  {
        this.structuredData.results.push(angular.copy(this.model.value));
        this.structuredData.results[0].reverse = this.model.reverse;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    confirm () {
        this.loader.save = true;
        this.prepareDnsIpsStruct();
        this.VpsService.setReversesDns(this.structuredData)
            .then(data => {
                if (data && data.state) {
                    switch (data.state) {
                    case "ERROR" :
                        this.$translate.instant("vps_configuration_reversedns_fail");
                        const messages = ! _.isEmpty(data.messages) ? data.messages : "";
                        // TODO: send this + _forEach eachtime
                        _.forEach(messages, (message) => this.CloudMessage.error(message.message || message));
                        break
                    case "PARTIAL" :
                        break;
                    case "OK" :
                        this.CloudMessage.success(this.$translate.instant("vps_configuration_reboot_rescue_success"))
                        break;
                    }
                }
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reversedns_fail")))
            .finally(() => {
                this.loader.save = false;
                this.$uibModalInstance.close();
            });
    }
}

angular.module("managerApp").controller("VpsReverseDnsCtrl", VpsReverseDnsCtrl);
