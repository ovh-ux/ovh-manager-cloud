/**
 * Special rules for redirections
 */
angular.module('managerApp').run(($transitions, $state, $stateParams, CloudUserPref, CPC_TASKS) => {
  $transitions.onSuccess({}, (transition) => {
    const state = transition.to();
    if (state && state.url === '/compute') {
      if ($state.includes('iaas.pci-project')) {
        if ($stateParams.createNewVm) {
          $state.go('iaas.pci-project.compute.infrastructure', {
            createNewVm: true,
          });
        } else {
          CloudUserPref.get(CPC_TASKS.onboardingKey)
            .then((taskOnBoardingPref) => {
              if (_.isEmpty(taskOnBoardingPref) || !_.get(taskOnBoardingPref, 'done')) {
                $state.go('iaas.pci-project.compute.taskOnboarding');
              } else {
                $state.go('iaas.pci-project.compute.infrastructure');
              }
            });
        }
      }
    } else if (state && state.url === '/billing') {
      $state.go('iaas.pci-project.billing.consumption');
    }
  });
});
