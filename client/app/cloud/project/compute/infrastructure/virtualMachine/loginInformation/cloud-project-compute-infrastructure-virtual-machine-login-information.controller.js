(() => {
    class CloudProjectComputeInfrastructureVirtualMachineLoginInformationCtrl {
        constructor ($uibModalInstance, params, $q, $state, $translate, CloudMessage, Poller, OvhApiCloudProjectInstance, CloudImageService) {
            this.$uibModalInstance = $uibModalInstance;
            this.$q = $q;
            this.$state = $state;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
            this.Poller = Poller;
            this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
            this.CloudImageService = CloudImageService;

            this.loading = true;
            this.poller = false;
            this.readOnlyError = false;
            this.data = {
                vm: params,
                ip: null,
                image: {},
                isWindows: false,
                hasApplication: false,
                applicationInfo: []
            };
        }

        $onInit () {
            this.loading = true;
            this.getLoginInfo()
                .catch((error) => {
                    this.CloudMessage.error(`${this.$translate.instant("login_information_error")} ${error.data.message}`);
                })
                .then(() => {
                    this.data.hasApplication = this.data.image.apps;
                    if (this.data.hasApplication) {
                        this.pollApplicationInfo(this.data.vm.serviceName, this.data.vm.id);
                    }
                })
                .finally(() => {
                    this.data.isWindows = this.data.image.type === "windows";
                    this.loading = false;
                });

        }

        getLoginInfo () {
            if (_.has(this.data.vm.ipAddresses, "length") && this.data.vm.image) {
                this.data.ip = this.getIp(this.data.vm.ipAddresses);
                this.data.image = this.CloudImageService.augmentImage(this.data.vm.image);
                return this.$q.resolve({});
            } else {
                return this.OvhApiCloudProjectInstance.Lexi().get({
                    serviceName: this.data.vm.serviceName,
                    instanceId: this.data.vm.id
                }).$promise
                    .then((instance) => {
                        if (!instance.image) {
                            return this.$q.reject({});
                        }
                        this.data.ip = this.getIp(instance.ipAddresses);
                        this.data.image = this.CloudImageService.augmentImage(instance.image);
                    });
            }
        }

        getIp (ipAddresses) {
            return _.find(ipAddresses, { version: 4 }) || ipAddresses[0] || null;
        }


        pollApplicationInfo (serviceName, instanceId) {
            this.poller = true;
            this.Poller.poll("/cloud/project/" + serviceName + "/instance/" + instanceId + "/applicationAccess",
                null,
                {
                    method: "POST",
                    successRule: function (appInfo) {
                        return appInfo.status === "ok";
                    },
                    namespace: "cloud.loginInformation",
                }
            ).then((appInfo) => {
                this.data.applicationInfo = appInfo.accesses;
            }, (error) => {
                const readonly = error.statusText === "ReadonlySession";
                this.readOnlyError = readonly;
                if (!readonly) {
                    this.CloudMessage.error(`${this.$translate.instant("login_information_error")} ${error.data.message}`);
                }
            }).finally(() => {
                this.poller = false;
            })
        }

        close () {
            this.Poller.kill({ namespace: "cloud.loginInformation" });
            this.$uibModalInstance.dismiss();
        };

        goToConsole () {
            this.Poller.kill({ namespace: "cloud.loginInformation" });
            this.$uibModalInstance.close(this.data.vm.id);
        };
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualMachineLoginInformationCtrl", CloudProjectComputeInfrastructureVirtualMachineLoginInformationCtrl);
})();
