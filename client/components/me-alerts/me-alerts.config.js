angular.module("managerApp").run(function ($translate, $translatePartialLoader, Flash, UserAlertsAapi, REDIRECT_URLS, TARGET) {
    "use strict";

    $translatePartialLoader.addPart("../components/me-alerts");

    $translate.refresh().then(function () {

        return UserAlertsAapi.query({
            target: TARGET
        }).$promise.then(function (alerts) {

            if (alerts && alerts.length) {
                var messages = [];

                angular.forEach(alerts, function (alert) {

                    if (alert.level === "warning") {
                        switch (alert.id) {
                        case "DEBTACCOUNT_DEBT":
                            if (_.get(alert, "data.debtAccount.unmaturedAmount.value", 0) > 0) {
                                messages.push($translate.instant("me_alerts_DEBTACCOUNT_DEBT_WITH_UNMATURED_AMOUNT", {
                                    dueAmount: _.get(alert, "data.debtAccount.dueAmount.text"),
                                    unmaturedAmount: _.get(alert, "data.debtAccount.unmaturedAmount.text")
                                }));
                            } else {
                                messages.push($translate.instant("me_alerts_DEBTACCOUNT_DEBT", {
                                    value: _.get(alert, "data.debtAccount.dueAmount.text")
                                }));
                            }
                            break;
                        case "OVHACCOUNT_DEBT":
                            messages.push($translate.instant("me_alerts_OVHACCOUNT_DEBT", { value: _.get(alert, "data.ovhAccount.balance.text"), date: _.get(alert, "data.ovhAccount.lastUpdate"), link: REDIRECT_URLS.ovhAccount }));
                            break;
                        case "PAYMENTMEAN_DEFAULT_MISSING":
                        case "PAYMENTMEAN_DEFAULT_EXPIRED":
                        case "PAYMENTMEAN_DEFAULT_BANKACCOUNT_PENDINGVALIDATION":
                        case "PAYMENTMEAN_DEFAULT_CREDITCARD_TOOMANYFAILURES":
                        case "PAYMENTMEAN_DEFAULT_PAYPAL_TOOMANYFAILURES":
                        case "OVHACCOUNT_ALERTTHRESHOLD":
                            messages.push($translate.instant("me_alerts_" + alert.id, { link: REDIRECT_URLS.paymentMeans }));
                            break;
                        case "ORDERS_DOCUMENTSREQUESTED":
                            messages.push($translate.instant("me_alerts_ORDERS_DOCUMENTSREQUESTED", { count: (_.get(alert, "data.ordersWithDocumentsRequested") || []).length, link: REDIRECT_URLS.ordersInProgress }));
                            break;
                        default:
                            var translatedAlert = $translate.instant("me_alerts_" + alert.id);
                            if (translatedAlert === ("me_alerts_" + alert.id)) {
                                // No translation
                                messages.push(alert.description);
                            } else {
                                messages.push(translatedAlert);
                            }
                        }
                    }
                });

                if (messages.length) {
                    Flash.create("warning", messages);
                }
            }

        });
    });
});
