angular
  .module('managerApp')
  .config(($stateProvider) => {
    $stateProvider.state('home', {
      url: '/',
      component: 'home',
      translations: {
        value: ['.', '../common'],
        format: 'json',
      },
    });
  });
