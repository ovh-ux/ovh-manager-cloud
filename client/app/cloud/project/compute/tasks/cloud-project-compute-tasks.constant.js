angular.module('managerApp')
  .constant('CPC_TASKS', {
    availableActions: ['snapshot'],
    schedules: ['rotate7', 'rotate14', 'custom'],
    defaultSchedules: {
      rotate7: {
        rotation: 7,
      },
      rotate14: {
        rotation: 14,
      },
    },
    onboardingKey: 'CLOUD_PROJECT_TASKS_ONBOARDING',
    mistralAPILink: 'https://docs.openstack.org/mistral/latest/',
  });
