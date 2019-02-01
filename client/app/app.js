import translateAsyncLoader from '@ovh-ux/translate-async-loader';
import cloudUniverseComponents from '../cloudUniverseComponents';

angular.module('managerApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngMessages',
  'pascalprecht.translate',
  'ui.bootstrap',
  'ui.router',
  'ui.validate',
  'ui.sortable',

  'ovh-angular-sso-auth',
  'ovh-angular-sso-auth-modal-plugin',
  'ovh-angular-apiv7',
  'ovh-api-services',
  'ovh-common-style',
  'ovh-angular-checkbox-table',
  'ovh-angular-form-flat',
  'ovh-angular-q-allSettled',
  'ovh-angular-stop-event',
  'ovh-angular-a-disabled',
  'angularMoment',
  'ovh-angular-toaster',
  'ovh-angular-swimming-poll',
  'oui',
  'oui.list-view',
  'chart.js',

  'ovh-angular-pagination-front',
  'ovh-angular-responsive-tabs',
  'mgcrea.ngStrap.popover',
  'mgcrea.ngStrap.tooltip',
  'mgcrea.ngStrap.helpers.dimensions',
  'mgcrea.ngStrap.core',
  'ovh-angular-responsive-page-switcher',
  'ovh-angular-responsive-popover',
  'ovh-angular-sidebar-menu',

  'ng-slide-down',
  'ovh-angular-jsplumb',
  'tmh.dynamicLocale',
  'ovh-angular-otrs',
  'ovh-api-services',

  'ovh-jquery-ui-draggable-ng',
  'ovh-angular-jquery-ui-droppable',
  'ovh-angular-slider',
  'ovh-angular-tail-logs',
  'ng-at-internet',
  'atInternetUiRouterPlugin',
  'matchmedia-ng',
  'ovh-angular-user-pref',
  'ovh-angular-doc-url',
  'ovhBrowserAlert',
  'angular-websocket',
  'angular-translate-loader-pluggable',

  translateAsyncLoader,
  cloudUniverseComponents,
])
  .config(($translateProvider, translatePluggableLoaderProvider, tmhDynamicLocaleProvider,
    TranslateServiceProvider, LANGUAGES) => {
    // Config current locale
    TranslateServiceProvider.setUserLocale();

    $translateProvider.useLoader('asyncLoader');
    $translateProvider.useLoaderCache(true);
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useMissingTranslationHandler('translateMissingTranslationHandler');
    $translateProvider.preferredLanguage(TranslateServiceProvider.getUserLocale());
    $translateProvider.use(TranslateServiceProvider.getUserLocale());
    $translateProvider.fallbackLanguage(LANGUAGES.fallback);

    tmhDynamicLocaleProvider.localeLocationPattern('angular-i18n/angular-locale_{{locale}}.js');
    tmhDynamicLocaleProvider.defaultLocale(_.kebabCase(TranslateServiceProvider.getUserLocale()));
  })
/*= =========  INTERCEPT ERROR IF NO TRANSLATION FOUND  ========== */
  .factory('translateInterceptor', ($q) => {
    const regexp = new RegExp(/Messages\w+\.json$/i);
    return {
      responseError(rejection) {
        if (regexp.test(rejection.config.url)) {
          return {};
        }
        return $q.reject(rejection);
      },
    };
  })
  .factory('translateMissingTranslationHandler', $sanitize => function (translationId) {
    // Fix security issue: https://github.com/angular-translate/angular-translate/issues/1418
    return $sanitize(translationId);
  })
  .config((responsivePopoverProvider) => {
    // tell to the module that we consider a mobile device with at least 800px width
    responsivePopoverProvider.setMobileMediaQuery('(max-width: 800px)');
  })
  .config((OtrsPopupProvider, REDIRECT_URLS) => {
    OtrsPopupProvider.setBaseUrlTickets(_.get(REDIRECT_URLS, 'support', null));
  })
  .config((ouiTableConfigurationProvider) => {
    ouiTableConfigurationProvider.setCssConfig({
      tablePanel: 'oui-table-panel',
      table: 'oui-table oui-table_responsive',
      thead: 'oui-table__headers',
      tbody: 'oui-table__body',
      tr: 'oui-table__row',
      th: 'oui-table__header',
      td: 'oui-table__cell',
      sortable: 'oui-table__cell_sortable oui-table__cell_sortable-asc',
      sorted: 'oui-table__cell_sorted',
      sortableAsc: 'oui-table__cell_sortable-asc',
      sortableDesc: 'oui-table__cell_sortable-desc',
      closed: 'oui-table__row_closed',
      emptyTable: 'oui-table-empty',
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
                  data-ng-model="$value"
                  data-ng-change="$onChange()">
                <label class="oui-checkbox__label-container" for="{{$name}}">
                  <span class="oui-checkbox__label">
                    <span class="oui-checkbox__icon">
                      <i class="oui-icon oui-icon-checkbox-unchecked" aria-hidden="true"></i>
                      <i class="oui-icon oui-icon-checkbox-checked" aria-hidden="true"></i>
                      <i class="oui-icon oui-icon-checkbox-checkmark" aria-hidden="true"></i>
                    </span>
                  </span>
                </label>
              </div>
            `);
  })
  .run(($transitions,
    $translate,
    ouiCriteriaAdderConfiguration,
    ouiDatagridConfiguration,
    ouiFieldConfiguration,
    ouiNavbarConfiguration,
    ouiPaginationConfiguration,
    ouiStepperConfiguration) => {
    const removeOnSuccessHook = $transitions.onSuccess({}, () => {
      _.set(ouiCriteriaAdderConfiguration, 'translations', {
        column_label: $translate.instant('common_criteria_adder_column_label'),
        operator_label: $translate.instant('common_criteria_adder_operator_label'),

        operator_boolean_is: $translate.instant('common_criteria_adder_operator_boolean_is'),
        operator_boolean_isNot: $translate.instant('common_criteria_adder_operator_boolean_isNot'),

        operator_string_contains: $translate.instant('common_criteria_adder_operator_string_contains'),
        operator_string_containsNot: $translate.instant('common_criteria_adder_operator_string_containsNot'),
        operator_string_startsWith: $translate.instant('common_criteria_adder_operator_string_startsWith'),
        operator_string_endsWith: $translate.instant('common_criteria_adder_operator_string_endsWith'),
        operator_string_is: $translate.instant('common_criteria_adder_operator_string_is'),
        operator_string_isNot: $translate.instant('common_criteria_adder_operator_string_isNot'),

        operator_number_is: $translate.instant('common_criteria_adder_operator_number_is'),
        operator_number_smaller: $translate.instant('common_criteria_adder_operator_number_smaller'),
        operator_number_bigger: $translate.instant('common_criteria_adder_operator_number_bigger'),

        operator_date_is: $translate.instant('common_criteria_adder_operator_date_is'),
        operator_date_isBefore: $translate.instant('common_criteria_adder_operator_date_isBefore'),
        operator_date_isAfter: $translate.instant('common_criteria_adder_operator_date_isAfter'),

        operator_options_is: $translate.instant('common_criteria_adder_operator_options_is'),
        operator_options_isNot: $translate.instant('common_criteria_adder_operator_options_isNot'),

        true_label: $translate.instant('common_criteria_adder_true_label'),
        false_label: $translate.instant('common_criteria_adder_false_label'),

        value_label: $translate.instant('common_criteria_adder_value_label'),
        submit_label: $translate.instant('common_criteria_adder_submit_label'),
      });

      _.set(ouiDatagridConfiguration, 'translations', {
        emptyPlaceholder: $translate.instant('common_datagrid_nodata'),
      });

      _.set(ouiFieldConfiguration, 'translations', {
        errors: {
          required: $translate.instant('common_field_error_required'),
          number: $translate.instant('common_field_error_number'),
          email: $translate.instant('common_field_error_email'),
          min: $translate.instant('common_field_error_min', { min: '{{min}}' }),
          max: $translate.instant('common_field_error_max', { max: '{{max}}' }),
          minlength: $translate.instant('common_field_error_minlength', { minlength: '{{minlength}}' }),
          maxlength: $translate.instant('common_field_error_maxlength', { maxlength: '{{maxlength}}' }),
          pattern: $translate.instant('common_field_error_pattern'),
          validIpAddress: $translate.instant('common_field_error_valid_ip_address'),
        },
      });

      _.set(ouiNavbarConfiguration, 'translations', {
        notification: {
          errorInNotification: $translate.instant('common_navbar_notification_error_in_notification'),
          errorInNotificationDescription: $translate.instant('common_navbar_notification_error_in_notification_description'),
          markRead: $translate.instant('common_navbar_notification_mark_as_read'),
          markUnread: $translate.instant('common_navbar_notification_mark_as_unread'),
          noNotification: $translate.instant('common_navbar_notification_none'),
          noNotificationDescription: $translate.instant('common_navbar_notification_none_description'),
        },
      });

      _.set(ouiPaginationConfiguration, 'translations', {
        resultsPerPage: $translate.instant('common_pagination_resultsperpage'),
        ofNResults: $translate.instant('common_pagination_ofnresults')
          .replace('TOTAL_ITEMS', '{{totalItems}}'),
        currentPageOfPageCount: $translate.instant('common_pagination_currentpageofpagecount')
          .replace('CURRENT_PAGE', '{{currentPage}}')
          .replace('PAGE_COUNT', '{{pageCount}}'),
        previousPage: $translate.instant('common_pagination_previous'),
        nextPage: $translate.instant('common_pagination_next'),
      });

      _.set(ouiStepperConfiguration, 'translations', {
        optionalLabel: $translate.instant('common_stepper_optional_label'),
        modifyThisStep: $translate.instant('common_stepper_modify_this_step'),
        skipThisStep: $translate.instant('common_stepper_skip_this_step'),
        nextButtonLabel: $translate.instant('common_stepper_next_button_label'),
        submitButtonLabel: $translate.instant('common_stepper_submit_button_label'),
        cancelButtonLabel: $translate.instant('common_stepper_cancel_button_label'),
      });

      removeOnSuccessHook();
    });
  });
