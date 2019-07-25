import component from './vps-rebuild.component';

export default /* @ngInject */($stateProvider) => {
  $stateProvider.state('iaas.vps.detail.dashboard.rebuild', {
    url: '/rebuild',
    views: {
      modal: {
        component: component.name,
      },
    },
    layout: 'modal',
    resolve: {
      availableImages: /* @ngInject */ (serviceName, vpsRebuild) => vpsRebuild
        .getAvailableImages(serviceName)
        .then(availableImages => _.sortBy(availableImages, 'name')),
      close: /* @ngInject */ $state => () => $state.go('^'),
      displayError: /* @ngInject */ (
        $translate,
        CucCloudMessage,
      ) => (errorMessage, errorDetail) => CucCloudMessage
        .error($translate.instant(errorMessage, { message: errorDetail })),
      displaySuccess: /* @ngInject */ (
        $transition$,
        $translate,
        CucCloudMessage,
        serviceName,
      ) => () => CucCloudMessage.success($translate.instant('vps_configuration_reinstall_success', { serviceName })),
      serviceName: /* @ngInject */ $transition$ => $transition$.params().serviceName,
      sshKeys: /* @ngInject */ VpsReinstallService => VpsReinstallService
        .getSshKeys().then(sshKeys => sshKeys.sort()),
    },
  });
};
