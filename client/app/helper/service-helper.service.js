(() => {
  const defaultSuccessMessage = 'common_global_success';
  const defaultErrorMessage = 'common_global_error';
  const defaultOrderSuccessMessage = 'common_order_success';
  const defaultOrderErrorMessage = 'common_order_error';

  class ServiceHelper {
    constructor($q, $translate, $window, CloudMessage) {
      this.$q = $q;
      this.$translate = $translate;
      this.$window = $window;

      this.CloudMessage = CloudMessage;
    }

    errorHandler(messageInput, containerName, pathsToGetErrorMessage) {
      return (error) => {
        const errorMessageConfig = {};

        const firstPaths = _.isArray(pathsToGetErrorMessage)
          ? pathsToGetErrorMessage
          : [pathsToGetErrorMessage];
        const standardPaths = [
          'data.message',
          'message',
          'data'];

        const paths = [...firstPaths, ...standardPaths];

        return (_.isArray(error) ? error : [error]).map((currentError) => {
          const matchingPath = paths.find(path => _.has(currentError, path));
          errorMessageConfig.apiMessage = _.get(currentError, matchingPath);

          if (_.isString(messageInput)) {
            errorMessageConfig.textToTranslate = messageInput;
          } else if (_.has(messageInput, 'text')) {
            errorMessageConfig.text = messageInput.text;
          } else if (_.has(messageInput, 'textHtml')) {
            errorMessageConfig.textHtml = messageInput.textHtml;
          } else if (_.has(messageInput, 'translateParams')) {
            errorMessageConfig.textToTranslate = messageInput.textToTranslate;
            errorMessageConfig.translateParams = messageInput.translateParams;
          } else {
            errorMessageConfig.textToTranslate = defaultErrorMessage;
          }

          const message = this.buildErrorMessage(errorMessageConfig);

          this.CloudMessage.error(message, containerName);

          return this.$q.reject(currentError);
        });
      };
    }

    buildErrorMessage(config) {
      const message = {
        text: null,
        textHtml: null,
      };

      if (config.text) {
        message.text = config.text;
      }
      if (config.textHtml) {
        message.textHtml = config.textHtml;
      }

      if (config.translateParams) {
        message.text = this.$translate.instant(config.textToTranslate, config.translateParams);
      } else if (config.textToTranslate) {
        message.text = this.$translate.instant(config.textToTranslate);
      }

      if (config.apiMessage) {
        message.text = `${message.text} ${config.apiMessage}`;
      }
      return message;
    }

    successHandler(message, containerName) {
      return data => (_.isArray(data) ? data : [data]).map((datum) => {
        let messageToWrite = this.$translate.instant(defaultSuccessMessage);

        if (message) {
          const jsonData = _.isFunction(datum, 'toJSON') ? datum.toJSON() : datum || {};
          messageToWrite = _.isString(message)
            ? this.$translate.instant(message, jsonData)
            : message;
        }

        this.CloudMessage.success(messageToWrite, containerName);

        return datum;
      });
    }

    static findOrderId(data) {
      let orderId = _.get(data, 'order.orderId');
      if (!orderId) {
        const matches = data.url.match(/orderId=(\d+)/);
        if (matches.length > 0) {
          orderId = matches[1]; // eslint-disable-line
        }
      }

      return orderId;
    }

    static findOrderUrl(data) {
      let url = _.get(data, 'order.url');
      if (!url) {
        url = _.get(data, 'url');
      }
      return url;
    }

    orderSuccessHandler(newWindow) {
      return (data) => {
        const orderUrl = this.constructor.findOrderUrl(data);
        let orderId = this.constructor.findOrderId(data);

        if (!orderUrl) {
          return this.$q.reject({
            data: {
              message: 'URL not found',
            },
          });
        }
        if (!orderId) {
          orderId = orderUrl;
        }

        _.set(newWindow, 'location', orderUrl);

        return this.$q.resolve({
          orderUrl,
          orderId,
        });
      };
    }

    orderSuccessMessage({ orderUrl, orderId }, message = defaultOrderSuccessMessage) {
      this.CloudMessage.success({
        textHtml: this.$translate.instant(message, {
          orderUrl,
          orderId,
        }),
      });
    }

    orderErrorHandler(newWindow) {
      return (err) => {
        newWindow.close();
        this.errorHandler(defaultOrderErrorMessage)(err);
      };
    }

    loadOnNewPage(orderPromise, config = {}) {
      const newWindow = this.$window.open('', '_blank');
      newWindow.document.write(this.$translate.instant('common_order_doing'));
      return orderPromise
        .then(this.orderSuccessHandler(newWindow))
        .then((data) => {
          if (_.isFunction(config.successMessage)) {
            return config.successMessage(data);
          }
          if (_.isString(config.successMessage)) {
            return this.orderSuccessMessage(data, config.successMessage);
          }
          return this.orderSuccessMessage(data);
        })
        .catch(this.orderErrorHandler(newWindow));
    }

    static getTaskProgressType(taskType) {
      switch (taskType) {
        case 'done':
          return 'success';
        case 'error':
          return 'error';
        case 'doing':
        case 'todo':
        case 'paused':
          return 'info';
        default:
          return 'warning';
      }
    }
  }

  angular.module('managerApp').service('ServiceHelper', ServiceHelper);
})();
