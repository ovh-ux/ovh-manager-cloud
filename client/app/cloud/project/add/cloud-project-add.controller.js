"use strict";

angular.module("managerApp").controller("CloudProjectAddCtrl",
    function ($q, $state, $translate, $rootScope, Toast, REDIRECT_URLS, FeatureAvailabilityService, Cloud, User, Vrack, $window, UserPaymentMeanCreditCard,
              SidebarMenu, CloudProjectSidebar) {

        var self = this;

        this.loaders = {
            init: true,
            creating: false
        };

        this.data = {
            projectsCount: 0,
            status: null,                // project creation status
            agreements: [],              // contracts agreements
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
        this.createProject = function () {
            var promiseContracts = true;
            self.loaders.creating = true;

            // If contracts: accept them
            if (self.model.contractsAccepted && self.data.agreements.length) {
                var queueContracts = [];
                angular.forEach(self.data.agreements, function (contract) {
                    queueContracts.push(User.Agreements().Lexi().accept({
                        id: contract.id
                    }, {}).$promise.then(function () {
                        _.remove(self.data.agreements, {
                            id: contract.id
                        });
                    }));
                });
                promiseContracts = $q.all(queueContracts);
            }

            return $q.when(promiseContracts).then(function () {
                return Cloud.Lexi().createProject({}, {
                    voucher: self.model.voucher || undefined,
                    description: self.model.description || undefined,
                    catalogVersion: self.model.catalogVersion || undefined,
                }).$promise.then(function (response) {
                    self.data.status = response.status;

                    switch (response.status) {
                    case "creating":
                        User.Order().Lexi().get({
                            orderId: response.orderId
                        }).$promise.then(function (order) {
                            $window.open(order.url, "_blank");
                            updateManager(response.project);
                            $state.go("iaas.pci-project.details", {
                                projectId: response.project,
                                fromProjectAdd: true
                            });
                            return Toast.success($translate.instant("cpa_success", { url: order.url }));
                        }, function () {
                            return Toast.error($translate.instant("cpa_error"));
                        });
                        break;
                    case "ok":
                        if (response.project) {
                            // Success: go to it
                            updateManager(response.project);
                            return $state.go("iaas.pci-project.details", {
                                projectId: response.project,
                                fromProjectAdd: true
                            });
                        } else {
                            // Because it's not normal
                            return Toast.error($translate.instant("cpa_error"));
                        }
                        break;
                    case "waitingAgreementsValidation":
                        self.data.agreements = [];
                        var queue = [];

                        // Get all contracts
                        if (response.agreements && response.agreements.length) {
                            angular.forEach(response.agreements, function (contractId) {
                                queue.push(User.Agreements().Lexi().contract({
                                    id: contractId
                                }).$promise.then(function (contract) {
                                    contract.id = contractId;
                                    self.data.agreements.push(contract);
                                }));
                            });
                        }

                        // for multi-project: say to user that there are contracts to sign
                        if (!self.loaders.init) {
                            Toast.info($translate.instant("cpa_error_contracts_tosign"));
                        }

                        return $q.all(queue);

                    // case "validationPending":
                    default:
                        return;
                    }
                });

            })["catch"](function (err) {
                if (err && err.status) {
                    switch (err.status) {
                    case 400:
                        return Toast.error($translate.instant("cpa_error_invalid_paymentmean"));
                    case 404:
                        return Toast.error($translate.instant("cpa_error_invalid_voucher"));
                    case 409:
                        return Toast.error($translate.instant("cpa_error_over_quota"));
                    default:
                        return Toast.error($translate.instant("cpa_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : ""));
                    }
                }
            })["finally"](function () {
                self.loaders.creating = false;
            });
        };

        // returns true if user has at least one bill and no debt
        this.isTrustedUser = function () {
            return this.has3dsCreditCard() || (self.data.hasBill && !self.data.hasDebt);
        };

        // returns true if user has at least one 3D secure registered credit card
        this.has3dsCreditCard = function () {
            return angular.isDefined(_.find(self.data.creditCards, "threeDsValidated"));
        };

        this.canCreateProject = function () {
            var canCreate = false;
            if (self.model.voucher) {
                canCreate = true;
            } else if (self.model.paymentMethod === self.model.noPaymentMethodEnum.BC) {
                canCreate = true;
            } else if (this.isTrustedUser()) {
                canCreate = angular.isDefined(self.data.defaultPaymentMean);
            }
            return canCreate;
        };

        function initUserFidelityAccount () {
            return User.FidelityAccount().Lexi().get().$promise.then(function (account) {
                return $q.when(account);
            }, function (err) {
                return err && err.status === 404 ? $q.when(null) : $q.reject(err);
            });
        }

        function initContracts () {
            return Cloud.Project().Lexi().query().$promise.then(function (ids) {
                // we need to create the first project in order to receive contracts
                return ids.length ? $q.when(true) : self.createProject();
            });
        }

        function initProject () {
            return $q.all({
                projectIds:       Cloud.Project().Lexi().query().$promise,
                price:            Cloud.Price().Lexi().query().$promise,
                user:             User.Lexi().get().$promise,
                defaultPayment:   User.PaymentMean().Lexi().getDefaultPaymentMean(),
                availablePayment: User.AvailableAutomaticPaymentMeans().Lexi().get().$promise,
                fidelityAccount:  initUserFidelityAccount(),
                bill:             User.Bill().Lexi().query().$promise,
                creditCards:      UserPaymentMeanCreditCard.Lexi().getCreditCards()
            }).then(function (result) {
                self.data.projectsCount = result.projectIds.length;
                self.data.projectPrice = result.price.projectCreation;
                self.data.defaultPaymentMean = result.defaultPayment;
                self.data.availablePaymentMeans = result.availablePayment;
                self.data.hasDebt = result.fidelityAccount && result.fidelityAccount.balance < 0;
                self.data.hasBill = result.bill.length > 0;
                self.data.creditCards = result.creditCards;
                self.model.description = $translate.instant("cloud_menu_project_num", { num: self.data.projectsCount + 1 });
                self.model.paymentMethod = self.model.noPaymentMethodEnum.MEAN;
            });
        }

        function init () {
            self.loaders.init = true;
            // Redirect US to onboarding
            if (FeatureAvailabilityService.hasFeature("PROJECT","expressOrder")) {
                $state.go("iaas.pci-project-onboarding", { location : "replace" });
                return;
            }
            initContracts().then(initProject)["catch"](function (err) {
                self.unknownError = true;
                Toast.error($translate.instant("cpa_error") + (err && err.data && err.data.message ? " (" + err.data.message + ")" : ""));
            })["finally"](function () {
                self.loaders.init = false;
            });
        }

        function updateManager (projectId) {
            CloudProjectSidebar.addToSection({
                project_id: projectId, // jshint ignore:line
                description: self.model.description
            });
            Vrack.Lexi().resetCache();
            Vrack.CloudProject().Lexi().resetQueryCache();
        }

        init();
    });
