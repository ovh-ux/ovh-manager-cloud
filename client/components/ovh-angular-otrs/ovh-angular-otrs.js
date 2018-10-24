angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(
    import(`ovh-angular-otrs/src/translations/Messages_${$translate.use()}.xml`)
      .catch(() => import(`ovh-angular-otrs/src/translations/Messages_${this.$translate.fallbackLanguage()}.xml`))
      .then(x => x.default),
  );
  $translate.refresh();
});
