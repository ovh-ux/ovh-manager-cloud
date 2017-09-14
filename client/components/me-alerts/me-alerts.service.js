class MeAlertsService {
    constructor ($translate, $translatePartialLoader, CloudMessage, OvhApiMeAlertsAapi, REDIRECT_URLS, TARGET) {
        this.$translatePartialLoader = $translatePartialLoader.addPart("../components/me-alerts");
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.UserAlertsAapi = OvhApiMeAlertsAapi;
        this.REDIRECT_URLS = REDIRECT_URLS;
        this.TARGET = TARGET;
    }

    getMessages () {
        this.$translate.refresh().then(() => this.UserAlertsAapi.query({
            target: this.TARGET
        }).$promise.then(alerts => {
            if (alerts && alerts.length) {
                angular.forEach(alerts, alert => {

                    if (alert.level === "warning") {
                        switch (alert.id) {
                        case "DEBTACCOUNT_DEBT":
                            if (_.get(alert, "data.debtAccount.unmaturedAmount.value", 0) > 0) {
                                this.warningAlert(this.$translate.instant("me_alerts_DEBTACCOUNT_DEBT_WITH_UNMATURED_AMOUNT", {
                                    dueAmount: _.get(alert, "data.debtAccount.dueAmount.text"),
                                    unmaturedAmount: _.get(alert, "data.debtAccount.unmaturedAmount.text")
                                }));
                            } else {
                                this.warningAlert(this.$translate.instant("me_alerts_DEBTACCOUNT_DEBT", {
                                    value: _.get(alert, "data.debtAccount.dueAmount.text"),
                                    link: this.REDIRECT_URLS.paymentMeans
                                }));
                            }
                            break;
                        case "OVHACCOUNT_DEBT":
                            this.warningAlert(this.$translate.instant("me_alerts_OVHACCOUNT_DEBT", { value: _.get(alert, "data.ovhAccount.balance.text"), date: _.get(alert, "data.ovhAccount.lastUpdate"), link: this.REDIRECT_URLS.ovhAccount }));
                            break;
                        case "PAYMENTMEAN_DEFAULT_MISSING":
                        case "PAYMENTMEAN_DEFAULT_EXPIRED":
                        case "PAYMENTMEAN_DEFAULT_BANKACCOUNT_PENDINGVALIDATION":
                        case "PAYMENTMEAN_DEFAULT_CREDITCARD_TOOMANYFAILURES":
                        case "PAYMENTMEAN_DEFAULT_PAYPAL_TOOMANYFAILURES":
                        case "OVHACCOUNT_ALERTTHRESHOLD":
                            this.warningAlert(this.$translate.instant(`me_alerts_${alert.id}`, { link: this.REDIRECT_URLS.paymentMeans }));
                            break;
                        case "ORDERS_DOCUMENTSREQUESTED":
                            this.warningAlert(this.$translate.instant("me_alerts_ORDERS_DOCUMENTSREQUESTED", { count: (_.get(alert, "data.ordersWithDocumentsRequested") || []).length, link: this.REDIRECT_URLS.ordersInProgress }));
                            break;
                        default:
                            const translatedAlert = this.$translate.instant(`me_alerts_${alert.id}`);
                            if (translatedAlert === `me_alerts_${alert.id}`) {
                                this.warningAlert(alert.description);
                            } else {
                                this.warningAlert(translatedAlert);
                            }
                        }
                    }
                });
            }
        }));
    }

    errorAlert (message) {
        return this.CloudMessage.error({textHtml: message}, "index");
    }

    warningAlert (message) {
        return this.CloudMessage.warning({textHtml: message}, "index");
    }

    infoAlert (message) {
        return this.CloudMessage.info({textHtml: message}, "index");
    }
}

angular.module("managerApp").service("MeAlertsService", MeAlertsService);
