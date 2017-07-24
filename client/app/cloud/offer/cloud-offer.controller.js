(() => {
    class CloudOfferCtrl {
        constructor ($q, $stateParams, FeatureAvailabilityService, CloudProjectAdd, User, URLS) {
            this.$q = $q;
            this.$stateParams = $stateParams;
            this.CloudProjectAdd = CloudProjectAdd;
            this.User = User;
            this.FeatureAvailabilityService = FeatureAvailabilityService;
            this.URLS = URLS;

            this.data = {
                defaultPayment: null,
                agreementsAccepted: [],
                agreements: []
            };

            this.model = {
                voucher: null,
                projectName: ""
            };

            this.state = {
                allAgreementsAccepted: false
            };

            this.loaders = {
                payment: true,
                agreements: true,
                start: false
            };

            this.features = [{
                    title: "cloud_offer_vrack",
                    explanation: "cloud_offer_vrack_explanation"
                },
                {
                    title: "cloud_offer_ipfo",
                    explanation: "cloud_offer_ipfo_explanation"
                },
                {
                    title: "cloud_offer_ipv6",
                    explanation: "cloud_offer_ipv6_explanation"
                },
                {
                    title: "cloud_offer_upgrade",
                    explanation: "cloud_offer_upgrade_explanation"
                },
                {
                    title: "cloud_offer_pca",
                    explanation: "cloud_offer_pca_explanation"
                },
                {
                    title: "cloud_offer_snapshot",
                    explanation: "cloud_offer_snapshot_explanation"
                },
                {
                    title: "cloud_offer_ssd",
                    explanation: "cloud_offer_ssd_explanation"
                },
                {
                    title: "cloud_offer_volume",
                    explanation: "cloud_offer_volume_explanation"
                },
                {
                    title: "cloud_offer_object_storage",
                    explanation: "cloud_offer_object_storage_explanation"
                },
                {
                    title: "cloud_offer_api",
                    explanation: "cloud_offer_api_explanation"
                }
            ];

            this.init();
        }

        init () {

            // Call not available for US customer
            if (!this.FeatureAvailabilityService.hasFeature("PROJECT","expressOrder")) {
                this.loaders.agreements = true;
                this.CloudProjectAdd.getProjectInfo()
                    .then(projectInfo => {
                        this.data.agreements = projectInfo.agreementsToAccept;
                        this.data.order = projectInfo.orderToPay;
                    })
                    .finally(() => {
                        this.loaders.agreements = false;
                    });
            }

            this.getDefaultPaymentMethod();
            this.model.voucher = this.$stateParams.voucher;
        }

        startProject () {
            this.loaders.start = true;

            // Use express order for US customers
            if (this.FeatureAvailabilityService.hasFeature("PROJECT","expressOrder")) {
                window.location.href = this.URLS["website_order"]["cloud-resell-eu"].US(this.model.projectName);
                return;
            }
            this.acceptAllAgreements()
                .then(() => {
                    this.createProject();
                });
        };

        agreementAcceptation (agreementId, accepted) {
            if (accepted) {
                this.data.agreementsAccepted.push(agreementId);
            } else {
                _.pull(this.data.agreementsAccepted, agreementId);
            }
            this.state.allAgreementsAccepted = this.data.agreementsAccepted.length === this.data.agreements.length;
        };

        canStartProject () {
            return this.data.agreements.length && !this.state.allAgreementsAccepted;
        };

        acceptAllAgreements () {
            var agreements = [];
            _.forEach(this.data.agreements, agreement => {
                agreements.push(this.acceptAgreement(agreement.id));
            });
            return this.$q.all(agreements)
                .catch(err => {
                    this.Toast.error(this.$translate.instant("cpa_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : ""));
                    this.loaders.start = false;
                });
        }

        acceptAgreement (agreementId) {
            return this.User.Agreements().Lexi().accept({
                id: agreementId
            }, {});
        }

        getDefaultPaymentMethod () {
            this.loaders.payment = true;
            this.User.PaymentMean().Lexi().getDefaultPaymentMean()
                .then(defaultPayment => {
                    this.data.defaultPayment = defaultPayment;
                })
                .finally(() => {
                    this.loaders.payment = false;
                });
        }

        createProject () {
            this.CloudProjectAdd.startProject(this.model.voucher, this.model.projectName)
                .catch(error => {
                    if (error.agreements) {
                        this.data.agreementsAccepted = [];
                        this.data.agreements = error.agreements;
                        this.state.allAgreementsAccepted = false;
                    }
                })
                .finally(() => {
                    this.loaders.start = false;
                });
        }
    }
    angular.module("managerApp").controller("CloudOfferCtrl", CloudOfferCtrl);
})();
