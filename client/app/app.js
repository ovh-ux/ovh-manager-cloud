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
    "ovh-list-view",

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
    .config(ouiTableConfigurationProvider => {
        ouiTableConfigurationProvider.setCssConfig({
            tablePanel: "oui-table-panel",
            table: "oui-table oui-table_responsive",
            thead: "oui-table__headers",
            tbody: "oui-table__body",
            tr: "oui-table__row cui-dropdown-menu-container",
            th: "oui-table__header",
            td: "oui-table__cell",
            sortable: "oui-table__cell_sortable oui-table__cell_sortable-asc",
            sorted: "oui-table__cell_sorted",
            sortableAsc: "oui-table__cell_sortable-asc",
            sortableDesc: "oui-table__cell_sortable-desc",
            closed: "oui-table__row_closed",
            emptyTable: "oui-table-empty"
        })
            .setPageSize(10)
            .setExpandButtonTemplate(`
                <i role="button"
                    class="oui-icon oui-icon-chevron-right oui-table__expand-button"></i>
            `)
            .setSelectorTemplate(`<div class="oui-checkbox">
                <input class="oui-checkbox__input"
                  id="{{$name}}"
                  type="checkbox"
                  ng-model="$value"
                  ng-change="$onChange()">
                <label class="oui-checkbox__label-container" for="{{$name}}">
                  <span class="oui-checkbox__icon">
                    <i class="oui-icon oui-icon-checkbox-unchecked" aria-hidden="true"></i>
                    <i class="oui-icon oui-icon-checkbox-checked" aria-hidden="true"></i>
                    <i class="oui-icon oui-icon-checkbox-checkmark" aria-hidden="true"></i>
                  </span>
                </label>
              </div>
            `);
    })
    .run(function ($translatePartialLoader) {
        "use strict";
        $translatePartialLoader.addPart("components");
    });
