"use strict";

angular.module("managerApp").controller("CloudprojectbillingvouchersCtrl",
    function ($q, $stateParams, $translate, OvhApiCloudProjectCredit, CloudMessage, $uibModal, OvhApiMeBill) {

        /*=================================
        =            VARIABLES            =
        =================================*/

        var self = this;

        this.loading = {
            init: false,
            vouchers: false,
            add: false
        };

        this.toggle = {
            openAddVoucher: false
        };

        this.model = {
            voucher: null
        };

        this.datas = {
            voucherIds: [],
            vouchers: []
        };

        this.sort = {
            by: "validity.from",
            reverse: true
        };

        /*======================================
        =            INITIALISATION            =
        ======================================*/

        function init () {
            self.loading.init = true;

            return OvhApiCloudProjectCredit.Lexi().query({
                serviceName: $stateParams.projectId
            }).$promise.then(function (voucherIds) {
                self.datas.voucherIds = voucherIds;
            }, function (err) {
                self.datas.voucherIds = null;
                CloudMessage.error([$translate.instant("cpb_vouchers_get_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loading.init = false;
            });
        }

        /*-----  End of INITIALISATION  ------*/

        /*-----  End of VARIABLES  ------*/

        this.toggleAddVoucher = function () {
            if (this.toggle.openAddVoucher) {
                this.model.voucher = null;
            }
            this.toggle.openAddVoucher = !this.toggle.openAddVoucher;
        };

        this.addVoucher = function () {
            this.loading.add = true;

            return OvhApiCloudProjectCredit.Lexi().save({
                serviceName: $stateParams.projectId
            }, {
                code: self.model.voucher
            }).$promise.then(function () {
                CloudMessage.success($translate.instant("cpb_vouchers_add_success"));
                init();
                self.toggleAddVoucher();
            }, function (err) {
                CloudMessage.error($translate.instant("cpb_vouchers_add_" + err.data.message));
            })["finally"](function () {
                self.loading.add = false;
            });
        };

        self.openAddCredit = function () {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: "app/cloud/project/billing/vouchers/addCredit/cloud-project-billing-vouchers-add-credit.html",
                controller: "CloudProjectBillingVouchersAddcreditCtrl",
                controllerAs: "CloudProjectBillingVouchersAddcreditCtrl"
            });
        };

        this.getVoucherDisplayName = function (voucher) {
            if (voucher.bill) {
                return $translate.instant("cpb_vouchers_name_credit_provisionning");
            } else {
                return voucher.description;
            }
        };

        /*==============================================
        =            PAGINATION AND SORTING            =
        ==============================================*/

        function futureVoucherWithPdfUrl (voucher) {
            return OvhApiMeBill.Lexi().get({ billId: voucher.bill }).$promise.then(function (bill) {
                voucher.pdfUrl = bill.pdfUrl;
                return voucher;
            }, function () {
                return voucher;
            });
        }

        this.transformItem = function (voucherId) {
            this.loading.vouchers = true;
            return OvhApiCloudProjectCredit.Lexi().get({
                serviceName: $stateParams.projectId,
                creditId: voucherId
            }).$promise.then(function (voucher) {
                return voucher.bill ? futureVoucherWithPdfUrl(voucher) : voucher;
            });
        };

        this.onTransformItemDone = function (vouchers) {
            this.loading.vouchers = false;
            this.datas.vouchers = vouchers;
        };

        this.sortBy = function (by) {
            if (by) {
                if (this.sort.by === by) {
                    this.sort.reverse = !this.sort.reverse;
                } else {
                    this.sort.by = by;
                }
            }
        };

        /*-----  End of PAGINATION AND SORTING  ------*/

        init();
    }
);
