class LogsStreamsHomeCtrl {
  constructor(
    $state,
    $stateParams,
    $translate,
    LogsStreamsService,
    ControllerHelper,
    CucCloudMessage,
    UrlHelper,
  ) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.serviceName = this.$stateParams.serviceName;
    this.LogsStreamsService = LogsStreamsService;
    this.ControllerHelper = ControllerHelper;
    this.CucCloudMessage = CucCloudMessage;
    this.UrlHelper = UrlHelper;
    this.initLoaders();
  }

  /**
   * initializes streams and quota object by making API call to get data
   *
   * @memberof LogsStreamsHomeCtrl
   */
  initLoaders() {
    this.quota = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsStreamsService.getQuota(this.serviceName),
    });
    this.streams = this.ControllerHelper.request.getArrayLoader({
      loaderFunction: () => this.LogsStreamsService.getStreams(this.serviceName),
    });
    this.quota.load();
    this.streams.load();
  }

  /**
   * navigates to add stream page
   *
   * @memberof LogsStreamsHomeCtrl
   */
  add() {
    this.$state.go('dbaas.logs.detail.streams.add', {
      serviceName: this.serviceName,
    });
  }

  /**
   * create stream
   *
   * @memberof LogsStreamsHomeCtrl
   */
  create() {
    this.LogsStreamsService.createStream(this.serviceName)
      .then(() => this.initLoaders());
  }

  /**
   * navigates to edit stream page
   *
   * @param {any} stream
   * @memberof LogsStreamsHomeCtrl
   */
  edit(stream) {
    this.$state.go('dbaas.logs.detail.streams.edit', {
      serviceName: this.serviceName,
      streamId: stream.info.streamId,
    });
  }

  /**
   * show delete stream confirmation modal
   *
   * @param {any} stream to delete
   * @memberof LogsStreamsHomeCtrl
   */
  showDeleteConfirm(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.ControllerHelper.modal.showDeleteModal({
      titleText: this.$translate.instant('logs_stream_delete_title'),
      textHtml: this.$translate.instant('logs_stream_delete_message', { stream: stream.info.title }),
    }).then(() => this.remove(stream));
  }

  /**
   * delete stream
   *
   * @param {any} stream to delete
   * @memberof LogsStreamsHomeCtrl
   */
  remove(stream) {
    this.delete = this.ControllerHelper.request.getHashLoader({
      loaderFunction: () => this.LogsStreamsService.deleteStream(this.serviceName, stream.info)
        .then(() => this.initLoaders())
        .finally(() => this.ControllerHelper.scrollPageToTop()),
    });
    this.delete.load();
  }

  /**
   * navigates to the alerts page
   *
   * @param {any} stream, stream for which alerts should be managed
   * @memberof LogsStreamsHomeCtrl
   */
  manageAlerts(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas.logs.detail.streams.alerts', {
      serviceName: this.serviceName,
      streamId: stream.info.streamId,
    });
  }

  /**
   * navigates to the alerts page
   *
   * @param {any} stream, stream for which alerts should be managed
   * @memberof LogsStreamsHomeCtrl
   */
  gotoArchives(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas.logs.detail.streams.archives', {
      serviceName: this.serviceName,
      streamId: stream.info.streamId,
    });
  }

  /**
   * navigates to follow live stream page
   *
   * @param {any} stream, stream to follow live
   * @memberof LogsStreamsHomeCtrl
   */
  followLive(stream) {
    this.CucCloudMessage.flushChildMessage();
    this.$state.go('dbaas.logs.detail.streams.follow', {
      serviceName: this.serviceName,
      streamId: stream.info.streamId,
    });
  }

  /**
   * extracts graylog web URL from stream
   *
   * @param {any} stream, stream for which URL needs to be extracted
   * @return {string} graylog url
   * @memberof LogsStreamsHomeCtrl
   */
  getGraylogUrl(stream) {
    return this.LogsStreamsService.getStreamGraylogUrl(stream);
  }

  copyToken(stream) {
    this.LogsStreamsService.copyStreamToken(stream);
    this.ControllerHelper.scrollPageToTop();
  }
}

angular.module('managerApp').controller('LogsStreamsHomeCtrl', LogsStreamsHomeCtrl);
