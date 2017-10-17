class CloudDbInstanceCtrl {
    constructor ($state, $stateParams, $translate, CloudDbInstanceService, CloudMessage, CloudNavigation, ControllerHelper) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.initLoaders();
    }

    $onInit () {
        this.CloudNavigation.init({
            state: "dbaas.cloud-db.instance.detail",
            stateParams: {
                projectId: this.$stateParams.projectId,
                instanceId: this.$stateParams.instanceId
            }
        });

        this.ooms.load();
    }

    initLoaders () {
        this.ooms = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbInstanceService.getOom(this.projectId, this.instanceId),
            successHandler: () => {
                if (this.ooms.data.length) {
                    const recentOom = _.filter(this.ooms.data, oom => oom.elapsed.ms <= moment.duration({ hours: 36 }).asMilliseconds());
                    const oomLinkMessage = recentOom.length > 1 ? "cloud_db_project_instance_oom_plural_link_text" : "cloud_db_project_instance_oom_single_link_text";

                    this.CloudMessage.warning({
                        text: this.$translate.instant("cloud_db_project_instance_oom_text"),
                        link: {
                            text: this.$translate.instant(oomLinkMessage, { oomNumber: recentOom.length }),
                            action: () => this.$state.go("dbaas.cloud-db.instance.detail.oom", { projectId: this.projectId, instanceId: this.instanceId }),
                            type: "action"
                        }
                    }, "dbaas.cloud-db");
                }
            }
        });
    }
}

angular.module("managerApp").controller("CloudDbInstanceCtrl", CloudDbInstanceCtrl);
