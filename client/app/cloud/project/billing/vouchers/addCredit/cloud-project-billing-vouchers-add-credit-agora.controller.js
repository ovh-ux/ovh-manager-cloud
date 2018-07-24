angular.module("managerApp").controller("CloudProjectBillingVouchersAddcreditAgoraCtrl", class CloudProjectBillingVouchersAddcreditAgoraCtrl {

    constructor ($http, $translate, $uibModalInstance, $window, CloudMessage) {
        this.$http = $http;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.$window = $window;
        this.CloudMessage = CloudMessage;
    }

    $onInit () {
        this.amount = 1000;
        this.loading = true;
        return this.$http.get("/order/catalog/formatted/cloud", {
            serviceType: "apiv6",
            params: {
                ovhSubsidiary: "US"
            }
        }).then((result) => {
            this.price = _.chain(result)
                .get("data.plans")
                .filter((p) => p.planCode === "credit" && p.pricingType === "purchase")
                .head()
                .get("details.pricings.default")
                .filter((p) => p.capacities.indexOf("installation") >= 0)
                .head()
                .get("price")
                .value();
        }).catch((err) => {
            this.CloudMessage.error([this.$translate.instant("cpb_vouchers_add_credit_load_err"), _.get(err, "data.message",  "")].join(" "));
            this.$uibModalInstance.dismiss();
            return $q.reject(err);
        }).finally(() => {
            this.loading = false;
        });
    }

    order () {
        const order = {
            planCode: "credit",
            productId: "cloud",
            pricingMode: "default",
            quantity: this.amount,
            configuration: [{
                label: "type",
                value: "public_cloud"
            }]
        };
        this.$window.open(`https://ovh.us/order/express/#/express/review?products=${JSURL.stringify([order])}`, "_blank", "noopener");
        this.$uibModalInstance.dismiss();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
});
