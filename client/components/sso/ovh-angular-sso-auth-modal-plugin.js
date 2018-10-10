angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(import(`ovh-angular-sso-auth-modal-plugin/src/modal/translations/Messages_${$translate.use()}.xml`).then(x => x.default));
  $translate.refresh();
});
