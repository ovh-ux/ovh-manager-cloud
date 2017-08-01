"use strict";

angular.module("managerApp")
  .controller("CloudProjectBillingRightsCtrl",
    function (Cloud, CloudProjectServiceInfos, User, $stateParams, Toast, $translate, REDIRECT_URLS, $window) {

        var self = this;
        var serviceName = $stateParams.projectId;

        self.model = {
            owner: "",
            billing: "",
            isAdmin: false, // do we have admin rights?
            isUSorCA: false // true if user country is USA or Canada
        };

        // admin & billing contact form
        self.contactFormData = {
            owner: "",
            billing: ""
        };

        // add user right form
        self.addRightFormData = {
            contact: "", // either Nic or Email depending on user country
            type: "readOnly"
        };

        // reference to the right the user want to delete
        self.removeRight = {
            accountId: null
        };

        // toggle display of form inputs
        self.toggle = {
            owner: false,
            billing: false,
            addUser: false
        };

        // table data
        self.data = {
            rightIds: [],
            rights: []
        };

        // spinners ...
        self.loader = {
            rights: false,
            addRight: false,
            removeRight: false
        };

        /* ==================================================
         * Initialization
         */

        self.init = function () {
            self.getRights();
            initContact();
        };

        function initContact () {
            return CloudProjectServiceInfos.Lexi().get({
                serviceName: serviceName
            }).$promise.then(function (infos) {
                self.model.owner = self.contactFormData.owner = infos.contactAdmin;
                self.model.billing = self.contactFormData.billing = infos.contactBilling;
                return User.Lexi().get().$promise.then(function (me) {
                    if (me.nichandle === infos.contactAdmin) {
                        self.model.isAdmin = true;
                    }
                    if (me.country) {
                        // check if the user country is USA or Canada, in this case we display
                        // email instead of NIC handle
                        self.model.isUSorCA = _.indexOf(["US", "CA"], me.country.toUpperCase()) >= 0;
                    }
                });
            });
        }

        /* ==================================================
         * Owner contact form
         */

        self.canChangeContacts = function () {
            return REDIRECT_URLS.contacts;
        };

        self.openContacts = function () {
            if (self.canChangeContacts()) {
                var redirectUrl = REDIRECT_URLS.contacts;
                redirectUrl = redirectUrl.replace("{serviceName}", serviceName);
                $window.open(redirectUrl, "_blank");
            }
        };

        // show or hide (toggle) the owner contact field
        self.toggleEditOwner = function () {
            self.toggle.owner = !self.toggle.owner;
            if (self.toggle.owner) {
                $("#ownerContactInput").focus();
            }
        };

        // when user validate edition of owner contact field
        self.validateEditOwner = function () {
            // @TODO call API
            /*if (self.contactFormData.owner !== self.model.owner) {
                CloudProjectServiceInfos.Lexi().put({
                    serviceName: serviceName
                }, {
                    contactAdmin: self.contactFormData.owner
                }).$promise.then(function () {
                    self.model.owner = self.contactFormData.owner;
                }, function (err) {
                    // error occured, reset value
                    self.contactFormData.owner = self.model.owner;
                    if (err && err.status === 400) {
                        Toast.error($translate.instant("cpb_contact_error_invalid"));
                    } else {
                        Toast.error($translate.instant("cpb_contact_error_other"));
                    }
                });
            }
            self.toggleEditOwner();*/
        };

        // watch for escape/enter keys when editing owner contact field
        self.watchOwnerInput = function (ev) {
            if (ev && ev.keyCode === 27) { // escape key
                ev.stopPropagation();
                ev.preventDefault();
                self.toggle.owner = false;
                self.contactFormData.owner = self.model.owner;
            }
        };

        /* ==================================================
         * Billing contact form
         */

        // show or hide (toggle) the billing contact field
        self.toggleEditBilling = function () {
            self.toggle.billing = !self.toggle.billing;
            if (self.toggle.billing) {
                $("#billingContactInput").focus();
            }
        };

        // when user validate edition of billing contact field
        self.validateEditBilling = function () {
            // @TODO call API
            /*if (self.contactFormData.billing !== self.model.billing) {
                CloudProjectServiceInfos.Lexi().put({
                    serviceName: serviceName
                }, {
                    contactBilling: self.contactFormData.billing
                }).$promise.then(function () {
                    self.model.billing = self.contactFormData.billing;
                }, function (err) {
                    // error occured, reset value
                    self.contactFormData.billing = self.model.billing;
                    if (err && err.status === 400) {
                        Toast.error($translate.instant("cpb_contact_error_invalid"));
                    } else {
                        Toast.error($translate.instant("cpb_contact_error_other"));
                    }
                });
            }
            self.toggleEditBilling();*/
        };

        // watch for escape/enter keys when editing billing contact field
        self.watchBillingInput = function (ev) {
            if (ev && ev.keyCode === 27) { // escape key
                ev.stopPropagation();
                ev.preventDefault();
                self.toggle.billing = false;
                self.contactFormData.billing = self.model.billing;
            }
        };

        /* ==================================================
         * Rights table
         */

        self.showAddRight = function () {
            self.toggle.addUser = true;
            self.addRightFormData = {
                contact: "", // either Nic or Email depending on user country
                type: "readOnly"
            };
            self.removeRight.accountId = null;
        };

        self.getRights = function (clearCache) {
            self.loader.rights = true;
            if (clearCache) {
                Cloud.Project().Acl().Lexi().resetQueryCache();
            }
            return Cloud.Project().Acl().Lexi().query({
                serviceName: serviceName
            }).$promise.then(function (rightIds) {
                self.data.rightIds = rightIds;
            }, function (err) {
                self.data.rightIds = null;
                Toast.error([$translate.instant("cpb_rights_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loader.rights = false;
            });
        };

        /**
         * Returns the NIC with "-ovh" appended if it was not the case.
         */
        function normalizedNic (name) {
            // check if the NIC is not an email (it could be the case for US users)
            if (/[@\.]+/.test(name)) {
                return name;
            }
            return _.endsWith(name, "-ovh") ? name : name + "-ovh";
        }

        self.validateAddRight = function () {
            self.loader.addRight = true;
            return Cloud.Project().Acl().Lexi().add({
                serviceName: serviceName
            }, {
                accountId: normalizedNic(self.addRightFormData.contact),
                type: self.addRightFormData.type
            }).$promise.then(function () {
                self.getRights(true);
                Toast.success($translate.instant("cpb_rights_table_rights_add_success"));
            }, function (err) {
                Toast.error([$translate.instant("cpb_rights_add_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.addRightFormData.contact = "";
                self.addRightFormData.type = "readOnly";
                self.loader.addRight = false;
                self.toggle.addUser = false;
            });
        };

        self.validateRemoveRight = function (accountId) {
            self.loader.removeRight = true;
            self.removeRight.accountId = accountId;
            return Cloud.Project().Acl().Lexi().remove({
                serviceName: serviceName,
                accountId: accountId
            }).$promise.then(function () {
                self.getRights(true);
                Toast.success($translate.instant("cpb_rights_table_rights_remove_success"));
            }, function (err) {
                Toast.error([$translate.instant("cpb_rights_remove_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loader.removeRight = false;
                self.removeRight.accountId = null;
            });
        };

        this.transformItem = function (accountId) {
            self.loader.rights = true;
            return Cloud.Project().Acl().Lexi().get({
                serviceName: serviceName,
                accountId: accountId
            }).$promise;
        };

        this.onTransformItemDone = function (rights) {
            self.loader.rights = false;
            this.data.rights = rights;
        };

        // Controller initialization
        self.init();
    }
);
