angular
  .module('managerApp')
  .config(($urlServiceProvider, $locationProvider) => {
    $urlServiceProvider.rules.otherwise('/');
    $locationProvider.html5Mode(false);
  })
  .run(($transitions, $state) => {
    $transitions.onError({}, (transition) => {
      const error = _.get(transition.error(), 'detail');
      // manage the specific LOADING_STATE_ERROR code
      // specific code that handle errors of state resolve
      if (_.get(error, 'code') === 'LOADING_STATE_ERROR') {
        $state.go('error', { error });
      }
    });
  });
