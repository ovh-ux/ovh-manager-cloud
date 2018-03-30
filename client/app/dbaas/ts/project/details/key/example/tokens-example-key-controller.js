angular.module("managerApp").controller("DBaasTsProjectDetailsKeyCtrl.exampleUseToken",
 function (params, OvhApiMe, $uibModalInstance, DBaasTsConstants) {
    "use strict";

    // -- Variables declaration
    var self = this;

    self.key = params.key;
    self.apiURL = params.apiURL;

    // TODO: support multiple key
    var permission = self.key.permissions[0];
    self.dbaastsApiURL = DBaasTsConstants.api[permission];

    // -- Init --

    function initGuideURL () {
        OvhApiMe.v6().get().$promise.then(function (me) {
          var lang = me.ovhSubsidiary;
          var guide = DBaasTsConstants.guides[permission];
          if (guide) {
              self.dbaastsGuideKeyUrl = guide[lang] || guide.FR;
          }
      });
    }

    initGuideURL();

    // --

    self.close = function () {
        $uibModalInstance.close();
    };

});
