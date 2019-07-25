export default class VpsRebuildController {
  /* @ngInject */
  constructor(vpsRebuild) {
    this.vpsRebuild = vpsRebuild;
  }

  $onInit() {
    this.vpsOptions = {
      doNotSendPassword: false,
    };
  }

  rebuildVps(options) {
    this.isLoading = true;
    return this.vpsRebuild
      .rebuildVps(this.serviceName, options)
      .then(() => this.close().then(() => {
        this.displaySuccess();
      }))
      .catch(error => this.close().then(() => {
        const errorDetail = _.get(error, 'data.message', error.message);
        this.displayError('vps_configuration_reinstall_fail', errorDetail);
      }));
  }
}
