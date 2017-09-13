angular.module("managerApp")
  .controller("CdaDetailsCtrl", function ($q, $stateParams, $translate, ovhDocUrl, URLS, CdaService) {
      "use strict";

      var self = this;

      self.CdaService = CdaService;

      self.serviceName = "";

      self.loading = true;

      self.guides = {
          title: $translate.instant("cda_guide_title"),
          list: [{
                    name: $translate.instant("cda_guide_name"),
                    url: ovhDocUrl.getDocUrl("cloud/storage/ceph")
                  }],
          footer: $translate.instant("cda_guide_footer")

      }

      function init () {
          self.loading = true;
          self.serviceName = $stateParams.serviceName;

          var initQueue = [];
          $q.allSettled(initQueue).finally(function () {
              self.loading = false;
          });
      }

      init();
  });