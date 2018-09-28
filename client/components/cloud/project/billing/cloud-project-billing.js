angular.module('managerApp').run(($translate, asyncLoader) => {
  asyncLoader.addTranslations(import(`./translations/Messages_${$translate.use()}.xml`).then(x => x.default));
  $translate.refresh();
});
