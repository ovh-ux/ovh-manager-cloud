"use strict";

angular.module("managerApp")
  .config(function ($stateProvider) {
      $stateProvider
      /**
       * EXISTING PROJECT
       * #/dbaas/timeseries/project/serviceName
       */

      // View project by project id
      .state("dbaas.dbaasts-project", {
          url: "/timeseries/project/{serviceName}",
          abstract: true,   // [don't touch] empty url goes to dbaasts-project.dbaasts-project-details
          templateUrl: "app/dbaas/ts/project/dbaasts-project.html",
          controller: "DBaasTsProjectCtrl",
          controllerAs: "DBaasTsProjectCtrl",
          translations: ["common", "dbaas/ts", "dbaas/ts/project"],
          atInternet: { ignore: true }
      });
  });
