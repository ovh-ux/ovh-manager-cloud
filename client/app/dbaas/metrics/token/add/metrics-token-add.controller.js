(() => {
    class MetricsTokenAddCtrl {
        constructor ($state, $stateParams, $translate, MetricService) {
            this.$state = $state;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.MetricService = MetricService;

            this.token = {};
            this.token.labels = [{ key: null, value: null }];

            this.permissions = [];
        }

        $onInit () {
            this.token.permission = "read";
            this.token.serviceName = this.serviceName;
            this.permissions.push({ value: "read", text: this.$translate.instant("metrics_token_add_permission_read") });
            this.permissions.push({ value: "write", text: this.$translate.instant("metrics_token_add_permission_write") });
        }

        confirm () {
            this.loading = true;
            this.checkLabels();
            this.MetricService.addToken(this.token)
                .then(() => this.$state.go("dbaas.metrics.detail.token", { serviceName: this.serviceName }, { reload: true }))
                .finally(() => {
                    this.loading = false;
                });
        }

        cancel () {
            history.back();
        }


        addLabel () {
            this.token.labels.push({ key: null, value: null });
        }

        removeLabel (index) {
            if (index !== -1) {
                this.token.labels.splice(index, 1);
            }
        }

        checkLabel (index) {
            if (this.token.labels[index].key == null || this.token.labels[index].value == null) {
                this.removeLabel(index);
            }
        }

        checkLabels () {
            _.forEach(this.token.labels, (element, index) => this.checkLabel(index));
        }

    }

    angular.module("managerApp").controller("MetricsTokenAddCtrl", MetricsTokenAddCtrl);
})();
