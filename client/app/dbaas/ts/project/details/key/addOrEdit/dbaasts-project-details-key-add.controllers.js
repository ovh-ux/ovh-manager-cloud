"use strict";

angular.module("managerApp").controller("DBaasTsProjectDetailsKeyAddOrEditCtrl",
function ($q, $state, $stateParams, $translate, OvhApiDBaasTsProjectKey, Toast) {

    // -- Variable declaration --

    var self = this;
    var serviceName = $stateParams.serviceName;
    var keyId = $stateParams.keyId;

    self.loaders = {
        init: false,
        addOrEdit: false
    };

    self.data = {
        permissions: _.indexBy(["READ", "WRITE"]),
        // Detect edition if a key id is present
        edition: keyId ? true : false
    };

    self.model = {
        permissions: [self.data.permissions.READ],
        tags: [{}] // Initialize tags with an empty object
    };

    // -- Initialization

    function init () {
        // Retrieve the key in edition
        if (self.data.edition) {
            self.loaders.init = true;
            OvhApiDBaasTsProjectKey.v6().get({
                serviceName: serviceName,
                keyId: keyId
            }).$promise.then(function (key) {
                self.loaders.init = false;
                self.model = key;
                // If no tags initialize tags with an empty array
                if (!key.tags) {
                    self.model.tags = [];
                }
            })["catch"](function (err) {
                Toast.error([$translate.instant("dtpdt_init_error"), err.data && err.data.message || ""].join(" "));
            })["finally"](function () {
                self.loaders.init = false;
            });
        }
    }

    init();

    // -- Create or update the key

    self.saveKey = function () {
        self.loaders.addOrEdit = true;

        var successMsg;
        var errorMsg;
        var req;

        // Filter empty keys in the tags
        self.model.tags = _.filter(self.model.tags, function (tag) {
            return tag.key;
        });

        self.model.serviceName = serviceName;

        if (self.data.edition) {
            successMsg = "dtpdt_edit_successful";
            errorMsg = "dtpdt_edit_error";
            req = OvhApiDBaasTsProjectKey.v6().update({
                serviceName: serviceName,
                keyId: keyId
            }, self.model);
        } else {
            successMsg = "dtpdt_creation_successful";
            errorMsg = "dtpdt_creation_error";
            req = OvhApiDBaasTsProjectKey.v6().create({
                serviceName: serviceName
            }, self.model);
        }

        req.$promise.then(function () {
            $state.go("^.dbaasts-project-details-key");
            Toast.info($translate.instant(successMsg));
        })["catch"](function (err) {
            Toast.error([$translate.instant(errorMsg), err.data && err.data.message || ""].join(" : "));
            self.loaders.addOrEdit = false;
        });
    };

    // -- Add / Remove a tag

    self.addTag = function () {
        self.model.tags.push({});
    };

    self.removeTag = function (index) {
        self.model.tags.splice(index, 1);
    };
});
