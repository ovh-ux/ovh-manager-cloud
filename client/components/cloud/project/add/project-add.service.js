(() => {
    "use strict";

    class CloudProjectAdd {
        constructor ($q, $translate, $state, $window, Toast, OvhApiCloud, OvhApiMe, OvhApiVrack, CloudProjectSidebar) {
            this.$q = $q;
            this.$translate = $translate;
            this.$state = $state;
            this.$window = $window;
            this.Toast = Toast;
            this.Cloud = OvhApiCloud;
            this.User = OvhApiMe;
            this.Vrack = OvhApiVrack;
            this.CloudProjectSidebar = CloudProjectSidebar;
        }

        startProject (voucher, description, catalogVersion) {

            //Agreements should be already accepted

            return this.Cloud.Lexi().createProject({}, {
                voucher: voucher,
                description: description,
                catalogVersion: catalogVersion
            })
                .$promise
                .then(response => {
                    switch (response.status) {
                        case "creating":
                            //User needs to pay something
                            this.User.Order().Lexi().get({
                                orderId: response.orderId
                            }).$promise
                                .then(order => {
                                    this.$window.open(order.url, "_blank");
                                    this.updateManager(response.project, description);
                                    atInternet.trackEvent({
                                        name : "[PCI]NewProject",
                                        page : "cloud-project::offer",
                                        customObject: {
                                            voucher: voucher
                                        }
                                    });
                                    this.$state.go("iaas.pci-project.details", {
                                        projectId: response.project,
                                        fromProjectAdd: true
                                    });
                                    this.Toast.success(this.$translate.instant("cpa_success", { url: order.url }));
                                })
                                .catch(() => {
                                    this.Toast.error(this.$translate.instant("cpa_error"));
                                });
                            break;
                        case "ok":
                            if (response.project) {
                                // Success: go to it
                                this.updateManager(response.project, description);
                                this.$state.go("iaas.pci-project.details", {
                                    projectId: response.project,
                                    fromProjectAdd: true,
                                    createNewVm: true
                                });
                            } else {
                                // Because it's not normal
                                this.Toast.error($translate.instant("cpa_error"));
                            }
                            break;
                        case "waitingAgreementsValidation":
                            var error = {
                                agreements: this.getAllAgreementsInfo(response.agreements)
                            };
                            this.Toast.info(this.$translate.instant("cpa_error_contracts_tosign"));
                            return this.$q.reject(error);
                        // case "validationPending":
                        default:
                            return;
                    }
                })
                .catch(err => {
                    if (err && err.status) {
                        switch (err.status) {
                            case 400:
                                return this.Toast.error(this.$translate.instant("cpa_error_invalid_paymentmean"));
                            case 404:
                                return this.Toast.error(this.$translate.instant("cpa_error_invalid_voucher"));
                            case 409:
                                return this.Toast.error(this.$translate.instant("cpa_error_over_quota"));
                            default:
                                return this.Toast.error(this.$translate.instant("cpa_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : ""));
                        }
                    } else if (err && err.agreements) {
                        return this.$q.reject(err);
                    }
                });
        }

        getProjectInfo () {
            return this.Cloud.Lexi().createProjectInfo()
                .$promise
                .then(response => {
                    return this.$q.all({
                        agreementsToAccept: this.getAllAgreementsInfo(response.agreements),
                        orderToPay: this.$q.when(response.order)
                    });
                })
                .catch(err => {
                    if (err && err.status) {
                        switch (err.status) {
                            case 409:
                                this.Toast.error(this.$translate.instant("cpa_error_over_quota"));
                                break;
                            default:
                                this.Toast.error(this.$translate.instant("cpa_error") + (err.data && err.data.message ? " (" + err.data.message + ")" : ""));
                        }
                    }
                });
        }

        getAllAgreementsInfo (agreementsIds) {
            var agreements = [];
            if (agreementsIds && agreementsIds.length) {
                _.forEach(agreementsIds, contractId => {
                    agreements.push(this.getContractInfo(contractId));
                });
            }
            return this.$q.all(agreements);
        }

        getContractInfo (contractId) {
            return this.User.Agreements().Lexi().contract({
                id: contractId
            })
                .$promise
                .then(contract => {
                    contract.id = contractId;
                    return contract;
                });
        }

        updateManager (projectId, description) {
            this.CloudProjectSidebar.addToSection({
                project_id: projectId, // jshint ignore:line
                description: description
            });
            this.Vrack.Lexi().resetCache();
            this.Vrack.CloudProject().Lexi().resetQueryCache();
        }
    }
    angular.module("managerApp").service("CloudProjectAdd", CloudProjectAdd);
})();
