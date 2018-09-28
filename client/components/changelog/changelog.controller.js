angular.module('managerApp')
  .controller('ChangelogCtrl', function ($uibModalInstance, OvhApiMe, OvhApiChangelog, TARGET) {
    const self = this;

    self.loading = false;
    self.error = false;
    self.content = [];

    function getUser() {
      return OvhApiMe.v6().get().$promise;
    }

    function getChangelog(country, zone) {
      return OvhApiChangelog.Aapi().query({
        subsidiary: country,
        where: zone,
      }).$promise;
    }

    function init() {
      self.loading = true;
      return getUser().then(user => getChangelog(user.ovhSubsidiary, TARGET).then((changelog) => {
        self.content = changelog;
      })).catch((err) => {
        self.error = err;
      }).finally(() => {
        self.loading = false;
      });
    }

    self.closeModal = function () {
      $uibModalInstance.dismiss();
    };

    init();
  });
