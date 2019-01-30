

angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('iaas.pci-project.billing.consumption', {
    url: '/consumption',
    views: {
      cloudProjectBilling: {
        templateUrl: 'app/cloud/project/billing/consumption/cloud-project-billing-consumption.html',
        controller: 'CloudProjectBillingConsumptionCtrl',
        controllerAs: 'BillingConsumptionCtrl',
      },
    },
    resolve: {
      isProjectUsingAgora: /* @ngInject */ ($transition$, OvhApiCloudProject) => OvhApiCloudProject
        .v6().get({ serviceName: $transition$.params().projectId }).$promise
        .then(({ planCode }) => planCode !== 'project.legacy' && planCode !== 'project.2018'),
      me: /* @ngInject */ OvhApiMe => OvhApiMe.v6().get().$promise,
    },
    translations: {
      value: ['.'],
      format: 'json',
    },
  });
});
