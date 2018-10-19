angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(
    import(`ovh-angular-sso-auth-modal-plugin/src/modal/translations/Messages_${$translate.use()}.xml`)
      .catch(() => import(`ovh-angular-sso-auth-modal-plugin/src/modal/translations/Messages_${$translate.fallbackLanguage()}.xml`))
      .then(x => x.default),
  );
  $translate.refresh();
});
