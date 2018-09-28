

angular.module('managerApp')
  .controller('CloudProjectCtrl', function CloudProjectCtrl($scope, $state, $stateParams, $transitions, OvhApiCloud, CloudProjectRightService) {
    const self = this;
    const serviceName = $stateParams.projectId;

    self.loaders = {
      project: false,
    };

    self.model = {
      project: null,
      hasWriteRight: true,
    };

    self.includes = function includes(stateName) {
      return $state.includes(stateName);
    };

    // reference to our rootScope state change listener
    let stateChangeListener = null;

    function init() {
      self.loaders.project = true;

      // get current project
      if (serviceName) {
        OvhApiCloud.Project().v6().get({
          serviceName,
        }).$promise
          .then((project) => {
            self.model.project = project;
            // if project is suspended, redirect to error page
            if (self.model.project.status === 'suspended' || self.model.project.status === 'creating') {
              $state.go('iaas.pci-project.details');
            } else {
              CloudProjectRightService.userHaveReadWriteRights(serviceName)
                .then((hasWriteRight) => {
                  self.model.hasWriteRight = hasWriteRight;
                });
            }
          })
          .finally(() => {
            self.loaders.project = false;
          });
      } else {
        $state.go('iaas.pci-project-new');
        return;
      }

      // before a state change, check if the destination project is suspended,
      // if it's the case just redirect to the error page
      stateChangeListener = $transitions.onStart({}, (transition) => {
        const toState = transition.to();
        const toParams = transition.params();
        // avoid infinite state redirection loop
        if (toState && toState.name === 'iaas.pci-project.details') {
          return;
        }
        // check if project is loaded
        if (!self.model.project) {
          return;
        }
        // redirection is only for suspended projects
        if (self.model.project.status !== 'suspended' && self.model.project.status !== 'creating') {
          return;
        }
        if (self.model.project.project_id === toParams.projectId) {
          $state.go('iaas.pci-project.details');
        }
      });
    }

    // when controller is destroyed we must remove global state change listener
    $scope.$on('$destroy', () => {
      if (stateChangeListener) {
        stateChangeListener();
      }
    });

    init();
  });
