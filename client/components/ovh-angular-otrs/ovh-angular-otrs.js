angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(import(`ovh-angular-otrs/src/translations/Messages_${$translate.use()}.xml`).then(x => x.default));
  $translate.refresh();
});

