(() => {
  class AnnouncementSummitCtrl {
    constructor($q, $uibModalInstance, locale) {
      this.$uibModalInstance = $uibModalInstance;
      this.$q = $q;
      this.locale = locale;
      this.isStopShowing = false;
    }

    stopShowing(value) {
      this.isStopShowing = value;
    }

    confirm() {
      this.$uibModalInstance.close();
    }

    cancel() {
      this.$uibModalInstance.dismiss(this.isStopShowing);
    }
  }

  angular.module('managerApp').controller('AnnouncementSummitCtrl', AnnouncementSummitCtrl);
})();
