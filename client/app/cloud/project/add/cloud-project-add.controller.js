"use strict";

angular.module("managerApp").controller("CloudProjectAddCtrl",
    function ($q, $state, $timeout, $translate, $window, CloudMessage, REDIRECT_URLS, FeatureAvailabilityService, OvhApiCloud,
              OvhApiMe, OvhApiOrder, OvhApiVrack, OvhApiMePaymentMeanCreditCard, SidebarMenu, CloudProjectSidebar,
              CloudProjectAddService, CloudPoll, ControllerNavigationHelper) {

        var self = this;

        this.loaders = {
            init: true,
            creating: false
        };

        this.data = {
            isFirstProjectCreation: true,
            status: null,                // project creation status
            defaultPaymentMean: null,
            projectPrice: null,          // price for creating a new project with BC
            availablePaymentMeans: {     // list of available payment means
                creditCard: false,
                bankAccount: false,
                paypal: false
            },
            hasDebt: false,              // true if user has debt (fidelity account balance < 0)
            hasBill: false               // true if user has at least one bill
        };

        this.model = {
            description: "",             // new project name
            contractsAccepted: false,
            voucher: null,
            paymentMethod: null,         // user choosen payment method (either MEAN or BC)
            noPaymentMethodEnum: _.indexBy(["MEAN", "BC"]),
            catalogVersion: null         //  null == latest 1 === old catalog
        };

        // PaymentMean URL (v6 dedicated) with sessionv6
        this.paymentmeanUrl = REDIRECT_URLS.paymentMeans;
        // Add credit card URL
        this.addCreditCardUrl = REDIRECT_URLS.addCreditCard;

        /**
         * Launch project creation process
         */
        this.createProject = () => {
            CloudMessage.flushMessages();

            self.loaders.creating = true;

            let promise = null;
            if (self.model.contractsAccepted) {
                promise = CloudProjectAddService.orderCloudProject(self.model.description, self.model.voucher)
                    .then(response => {
                        ControllerNavigationHelper.addQueryParam("orderId", response.orderId);

                        self.data.activeOrder = response;
                        // We empty the contracts since we know the user just approved them and that agora
                        // doesn't allow us to tell it a contract is accepted.
                        self.data.activeOrder.contracts = [];

                        if (response.prices.withTax.value) {
                            $window.open(response.url);
                            self.data.activeOrder.deliveryStatus = "unpaid";
                        } else {
                            self.data.activeOrder.deliveryStatus = "delivering";
                        }

                        self.pollOrder(response.orderId);
                    });
            } else {
                promise = CloudProjectAddService.getOrderSummary(self.model.description, self.model.voucher)
                    .then(response => {
                        self.data.activeOrder = response;
                    });
            }

            return promise
                .catch(error => this.handleError(error))
                .finally(() => {
                    self.loaders.creating = false;
                });
        };

        this.pollOrder = function (orderId) {
            const cloudOrder = {};
            if (self.data.poller) {
                self.data.poller.kill();
            }

            self.data.poller = CloudPoll.poll({
                item: cloudOrder,
                pollFunction: () => CloudProjectAddService.getCloudProjectOrder(orderId).then(response => {
                        self.data.activeOrder.deliveryStatus = response.deliveryStatus;
                        return response;
                    }),
                stopCondition: item => item.deliveryStatus === "delivered",
                interval: 3000
            });
            
            self.data.poller.$promise
                .then(() => {
                    self.data.projectReady = true;
                    return $timeout(() => {
                        CloudProjectSidebar.addToSection({
                            project_id: cloudOrder.serviceName, // jshint ignore:line
                            description: self.model.description
                        });
                        OvhApiVrack.Lexi().resetCache();
                        OvhApiVrack.CloudProject().Lexi().resetQueryCache();

                        $state.go("iaas.pci-project.compute", {
                            projectId: cloudOrder.serviceName
                        });
                    }, 3000);
                })
                .catch(() => this.handleError({}));

            return self.data.poller;
        }

        // returns true if user has at least one bill and no debt
        this.isTrustedUser = function () {
            return this.has3dsCreditCard() || (self.data.hasBill && !self.data.hasDebt);
        };

        // returns true if user has at least one 3D secure registered credit card
        this.has3dsCreditCard = function () {
            return angular.isDefined(_.find(self.data.creditCards, "threeDsValidated"));
        };

        this.orderIsDelivering = () => self.data.activeOrder && self.data.activeOrder.deliveryStatus === "delivering";

        this.awaitingContractValidation = () => self.data.activeOrder && self.data.activeOrder.contracts.length;

        this.awaitingDelivery = () => !self.loaders.creating && self.data.activeOrder && !this.awaitingContractValidation() && self.model.contractsAccepted;

        this.handleError = error => {
            self.data.activeOrder = undefined;
            self.model.contractsAccepted = false;
            CloudMessage.error($translate.instant("cpa_error", error.data));
        };

        function initUserFidelityAccount () {
            return OvhApiMe.FidelityAccount().Lexi().get().$promise.then(function (account) {
                return $q.when(account);
            }, function (err) {
                return err && err.status === 404 ? $q.when(null) : $q.reject(err);
            });
        }

        function initProject () {
            return $q.all({
                projectIds:       OvhApiCloud.Project().Lexi().query().$promise,
                user:             OvhApiMe.Lexi().get().$promise,
                defaultPayment:   OvhApiMe.PaymentMean().Lexi().getDefaultPaymentMean(),
                availablePayment: OvhApiMe.AvailableAutomaticPaymentMeans().Lexi().get().$promise,
                fidelityAccount:  initUserFidelityAccount(),
                bill:             OvhApiMe.Bill().Lexi().query().$promise,
                creditCards:      OvhApiMePaymentMeanCreditCard.Lexi().getCreditCards(),
                price:            CloudProjectAddService.getCloudCreditPrice()
            }).then(function (result) {
                self.data.projectReady = false;
                self.data.isFirstProjectCreation = !result.projectIds.length;
                self.data.projectPrice = result.price;
                self.data.defaultPaymentMean = result.defaultPayment;
                self.data.availablePaymentMeans = result.availablePayment;
                self.data.hasDebt = result.fidelityAccount && result.fidelityAccount.balance < 0;
                self.data.hasBill = result.bill.length > 0;
                self.data.creditCards = result.creditCards;
                self.data.user = result.user;
                self.model.description = $translate.instant("cloud_menu_project_num", { num: result.projectIds.length + 1 });
                self.model.paymentMethod = self.model.noPaymentMethodEnum.MEAN;
            });
        }

        function refreshMessage () {
            self.messages = self.messageHandler.getMessages();
        }

        function init () {
            self.loaders.init = true;
            // Redirect US to onboarding
            if (FeatureAvailabilityService.hasFeature("PROJECT","expressOrder")) {
                $state.go("iaas.pci-project-onboarding", { location : "replace" });
                return;
            }

            CloudMessage.unSubscribe("iaas.pci-project-new");
            self.messageHandler = CloudMessage.subscribe("iaas.pci-project-new", { onMessage: () => refreshMessage() });

            const orderId = ControllerNavigationHelper.getQueryParam("orderId");
            if (orderId) {
                CloudProjectAddService.getCloudProjectOrder(parseInt(orderId, 10), { expand: true })
                    .then(response => {
                        response.contracts = [];
                        self.data.activeOrder = response;
                        self.model.contractsAccepted = true;
                        self.pollOrder(orderId);
                    })
                    .finally(() => {
                        self.loaders.init = false;
                    });
                return;
            };

            initProject()["catch"](function (err) {
                self.unknownError = true;
                CloudMessage.error(this.handleError(err.data));
            })["finally"](function () {
                self.loaders.init = false;
            });
        }

        init();
    });
