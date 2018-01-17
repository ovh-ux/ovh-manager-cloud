"use strict";

angular.module("managerApp").controller("CloudprojectbillingvouchersCtrl",
    function ($q, $stateParams, $translate, OvhApiCloudProjectCredit, CloudMessage, $uibModal, OvhApiMeBill) {

        /*=================================
        =            VARIABLES            =
        =================================*/

        var self = this;

        this.loading = {
            init: false,
            vouchers: false
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
            }).$promise.then(voucherIds => {
                self.datas.voucherIds = voucherIds;
                _.forEach(voucherIds, id => self.transformItem(id)
                    .then(voucher => self.datas.vouchers.push(voucher)));
            }, function (err) {
                self.datas.voucherIds = null;
                CloudMessage.error([$translate.instant("cpb_vouchers_get_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loading.init = false;
            });
        }

        /*-----  End of INITIALISATION  ------*/

        /*-----  End of VARIABLES  ------*/

        this.openAddVoucher = function () {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: "app/cloud/project/billing/vouchers/addVoucher/cloud-project-billing-vouchers-add.html",
                controller: "CloudProjectBillingVoucherAddCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => $stateParams.projectId
                }
            }).result.then(() => init());
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

        function futureVoucherWithPdfUrl (voucher) {
            return OvhApiMeBill.Lexi().get({ billId: voucher.bill }).$promise.then(function (bill) {
                voucher.pdfUrl = bill.pdfUrl;
                return voucher;
            }, function () {
                return voucher;
            });
        }

        this.transformItem = function (voucherId) {
            return OvhApiCloudProjectCredit.Lexi().get({
                serviceName: $stateParams.projectId,
                creditId: voucherId
            }).$promise.then(voucher => voucher.bill ? futureVoucherWithPdfUrl(voucher) : voucher);
        };

        init();
    }
);
