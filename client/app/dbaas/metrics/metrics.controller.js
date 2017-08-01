angular
    .module("managerApp")
    .controller("DBaasMetricsCtrl", class {

        constructor ($stateParams, $translate, metricsService, Toast, SidebarMenu) {

            this.serviceLoading = true;
            this.srv = metricsService;
            this.toast = Toast;
            this.trad = $translate;
            this.sm = SidebarMenu;

            metricsService.setService($stateParams.serviceName);

            metricsService.getService()
                .then((service) => {
                    this.service = service;
                    this.serviceLoading = false;
                })
                .catch((err) => {
                    Toast.error(this.trad.instant("metrics_err_service"), err);
                });

            metricsService.getConsumption()
                .then((conso) => {
                    this.consumption = conso;
                })
                .catch((err) => {
                    Toast.error(this.trad.instant("metrics_err_conso"), err);
                });
        }

        setDescription (d) {
            this.descriptionUpdating = true;
            this.srv
                .setServiceDescription(d)
                .then(() => {
                    this.toast.success(this.trad.instant("metrics_setting_updated"));
                    this.editDesc = false;
                    this.descriptionUpdating = false;
                    this.service.description = d;

                    // update sidebar title
                    const metricsItem = this.sm.getItemById(this.srv.getServiceName());
                    if (metricsItem) {
                        metricsItem.title = d;
                    }
                })
                .catch((err) => {
                    this.toast.error(this.trad.instant("metrics_setting_update_failed"), err);
                });
        }
});
