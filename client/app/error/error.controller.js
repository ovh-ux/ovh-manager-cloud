export default class ErrorCtrl {
  constructor($transition$) {
    this.$transition$ = $transition$;
  }

  $onInit() {
    this.error = _.get(this.$transition$.params(), 'error');

    if (_.get(this.error, 'code') === 'LOADING_STATE_ERROR') {
      // reomve code to display common message
      this.error.code = null;
    }
  }
}
