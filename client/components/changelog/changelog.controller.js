angular.module("managerApp")
  .controller("ChangelogCtrl", function ($uibModalInstance, OvhApiMe, OvhApiChangelog, TARGET) {
    "use strict";
    var self = this;

    self.loading   = false;
    self.error     = false;
    self.content = [];

    function getUser () {
        return OvhApiMe.Lexi().get().$promise;
    }

    function getChangelog (country, zone) {
        return OvhApiChangelog.Aapi().query({
            subsidiary: country,
            where: zone
        }).$promise;
    }

    function init () {
        self.loading = true;
        return getUser().then(function (user) {
            return getChangelog(user.ovhSubsidiary, TARGET).then(function (changelog) {
                self.content = changelog;
            });
        })["catch"](function (err) {
            self.error = err;
        })["finally"](function () {
            self.loading = false;
        });
    }

    self.closeModal = function () {
        $uibModalInstance.dismiss();
    };

    init();
});
