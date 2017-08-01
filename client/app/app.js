angular.module("managerApp", [
  "ngCookies",
  "ngResource",
  "ngSanitize",
  "ngAnimate",
  "ngMessages",
  "pascalprecht.translate",
  "ovh-angular-toggleClass",
  "ovh-angular-manager-navbar",
  "ui.bootstrap",
  "ui.router",
  "ui.validate",
  "ui.sortable",

  "ovh-angular-sso-auth",
  "ovh-angular-sso-auth-modal-plugin",
  "ovh-api-services",
  "ovh-common-style",
  "ovh-angular-checkbox-table",
  "ovh-angular-form-flat",
  "ovh-angular-q-allSettled",
  "ovh-angular-stop-event",
  "ovh-angular-a-disabled",
  "angularMoment",
  "ovh-angular-toaster",
  "ovh-angular-swimming-poll",
  "oui",

  "ovh-angular-pagination-front",
  "ovh-angular-responsive-tabs",
  "mgcrea.ngStrap.popover",
  "mgcrea.ngStrap.tooltip",
  "mgcrea.ngStrap.helpers.dimensions",
  "mgcrea.ngStrap.core",
  "ovh-angular-responsive-page-switcher",
  "ovh-angular-responsive-popover",
  "ovh-angular-sidebar-menu",

  "ng-slide-down",
  "ovh-angular-jsplumb",
  "tmh.dynamicLocale",
  "ovh-angular-module-status",
  "ovh-angular-otrs",
  "ovh-api-services",

  "ovh-jquery-ui-draggable-ng",
  "ovh-angular-jquery-ui-droppable",
  "ovh-angular-slider",
  "ng-at-internet",
  "atInternetUiRouterPlugin",
  "ngFlash",
  "matchmedia-ng",
  "ovh-angular-user-pref",
  "ovh-angular-doc-url",
  "ovhBrowserAlert"
])

.config(function ($stateProvider, TranslateDecoratorServiceProvider, TranslateServiceProvider) {
    "use strict";

    // Config current locale
    TranslateServiceProvider.setUserLocale();

    // Add translations decorator (need to be added before routes definitions)
    TranslateDecoratorServiceProvider.add($stateProvider);
})
.config(function ($urlRouterProvider, $locationProvider) {
    "use strict";
    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(false);
})
.config(function (responsivePopoverProvider) {
    // tell to the module that we consider a mobile device with at least 800px width
    responsivePopoverProvider.setMobileMediaQuery("(max-width: 800px)");
})
.run(function ($translatePartialLoader) {
    "use strict";
    $translatePartialLoader.addPart("components");
});
