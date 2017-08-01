angular
    .module("managerApp")
    .controller("DBaasMetricsUpgradeCtrl", class {

        constructor (METRICS_PLANS, metricsService) {
            this.plans = METRICS_PLANS;
            metricsService.getService()
                .then((service) => {
                    this.service = service;
                    this.currentPlan = this.plans[this.service.type][this.service.offer];
                });
        }

        // only return upgradable plans
        upgradeOnly (plans) {
            const f = {};
            _.forEach(plans, (plan, planID) => {
                if (plan.level > this.currentPlan.level) {
                    f[planID] = plan;
                }
            });
            return f;
        }
});
