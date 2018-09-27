angular.module('managerApp')
  .config((SidebarMenuProvider) => {
    SidebarMenuProvider.addTranslationPath('../components/sidebar');
  })
  .constant('SIDEBAR_MIN_ITEM_FOR_SEARCH', 10);
