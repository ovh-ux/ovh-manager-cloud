class ControllerHelper {
  constructor($timeout, $window, ControllerModalHelper, ControllerRequestHelper,
    ControllerNavigationHelper) {
    this.request = ControllerRequestHelper;
    this.modal = ControllerModalHelper;
    this.navigation = ControllerNavigationHelper;
    this.$timeout = $timeout;
    this.$window = $window;
  }

  static downloadUrl(url) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadContent(config) {
    const { fileContent, fileName } = config;

    let charSet = '';
    if (navigator.platform.toUpperCase().indexOf('WIN') > -1) {
      charSet = 'charset=windows-1252;base64';
    } else {
      charSet = 'charset=utf-8;base64';
    }

    const dataString = btoa(unescape(encodeURIComponent(fileContent)));
    const link = document.createElement('a');
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(new Blob([config.content], { type: `text/plain;${charSet}` }), fileName);
    } else if (link.download !== undefined) {
      link.setAttribute('href', `data:text/plain;${charSet},${dataString}`);
      link.setAttribute('download', fileName);
      link.setAttribute('style', 'visibility:hidden');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(`data:text/plain;${charSet},${dataString}`);
    }
  }

  /**
   * copies given message to clipboard
   * @param {string} messageToCopy, message to copy to clipboard
   * @return {any} error if copy failed, empty string otherwise
   */
  static copyToClipboard(messageToCopy) {
    try {
      const dummy = document.createElement('input');
      document.body.appendChild(dummy);
      dummy.setAttribute('id', 'dummy_id');
      dummy.setAttribute('value', messageToCopy);
      dummy.select();
      document.execCommand('copy');
      document.body.removeChild(dummy);
    } catch (err) {
      return err;
    }
    return '';
  }

  static htmlDecode(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  static naturalCompare(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const minLength = Math.min(words1.length, words2.length);
    for (let wordIndex = 0; wordIndex < minLength; wordIndex += 1) {
      const word1 = words1[wordIndex];
      const word2 = words2[wordIndex];
      if (word1 !== word2) {
        /* eslint-disable no-nested-ternary */
        return !Number.isNaN(word1) && !Number.isNaN(word2)
          ? parseFloat(word1) > parseFloat(word2)
          : word1 > word2 ? 1 : -1;
        /* eslint-enable no-nested-ternary */
      }
    }
    return words1.length > words2.length ? 1 : 0;
  }

  scrollPageToTop() {
    this.$timeout(() => this.$window.scrollTo(0, 0), 100);
  }
}

angular.module('managerApp').service('ControllerHelper', ControllerHelper);
