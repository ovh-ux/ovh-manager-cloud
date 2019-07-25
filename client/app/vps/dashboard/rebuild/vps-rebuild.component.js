import controller from './vps-rebuild.controller';
import template from './vps-rebuild.html';

export default {
  bindings: {
    availableImages: '<',
    close: '<',
    displayError: '<',
    displaySuccess: '<',
    serviceName: '<',
    sshKeys: '<',
  },
  controller,
  name: 'ovhManagerVpsRebuild',
  template,
};
