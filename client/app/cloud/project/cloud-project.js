"use strict";

angular.module("managerApp")
  .config(function ($stateProvider) {
      $stateProvider
        /**
         * EXISTING PROJECT
         * #/cloud/project/projectId
         */

        //View project by project id
      .state("iaas.pci-project", {
          url: "/pci/project/{projectId}",
          abstract: true,   // [don't touch] empty url goes to cloud-project.cloud-project-details
          templateUrl: "app/cloud/project/cloud-project.html",
          controller: "CloudProjectCtrl",
          controllerAs: "CloudProjectCtrl",
          translations: ["common", "cloud", "cloud/project"],
          atInternet: { ignore: true }
      });
  });
