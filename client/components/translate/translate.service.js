/**
 * @ngdoc service
 * @name managerApp.service:TranslateService
 * @description Manage translations
 */
class TranslateServiceProvider {
  constructor(LANGUAGES, TARGET) {
    this.LANGUAGES = LANGUAGES;
    this.TARGET = TARGET;
    this.localeRegex = /^([a-zA-Z]+)(?:[_-]([a-zA-Z]+))?$/;
    this.availableLangsKeys = _.map(this.LANGUAGES.available, 'key');
    this.currentLanguage = this.LANGUAGES.defaultLoc;
  }

  /**
   * @ngdoc function
   * @methodOf managerApp.service:TranslateService
   * @name setUserLocale
   * @description Set current user locale (in localStorage)
   * @param  {String} localeParam - (optional) Force to set the gicen locale identifier
   */
  setUserLocale(localeParam) {
    let locale = localeParam;
    if (!locale) {
      if (localStorage['univers-selected-language']) {
        locale = localStorage['univers-selected-language'];
      } else if (navigator.language || navigator.userLanguage) {
        locale = navigator.language || navigator.userLanguage;
      } else {
        locale = this.LANGUAGES.defaultLoc;
      }
    }
    const splittedLocale = locale.match(this.localeRegex);
    if (splittedLocale) {
      // Format the value
      const language = splittedLocale[1];
      const country = splittedLocale[2] ? splittedLocale[2] : this.preferredCountry(language);
      this.currentLanguage = this.findLanguage(language, country);
    } else {
      // Incorrect value
      this.currentLanguage = this.currentLanguage || this.LANGUAGES.defaultLoc;
    }
    // Save it!
    localStorage['univers-selected-language'] = this.currentLanguage;
  }

  /**
   * @ngdoc function
   * @methodOf managerApp.service:TranslateService
   * @name getUserLocale
   * @description Returns the current user locale
   * @param  {Boolean} min - (optional) Return the base locale only
   * @return {String}      - Current locale
   */
  getUserLocale(min) {
    if (min) {
      return this.currentLanguage.split('_')[0];
    }
    return this.currentLanguage;
  }

  /**
   * @ngdoc function
   * @methodOf managerApp.service:TranslateService
   * @name getGeneralLanguage
   * @description Returns either fr or en depending on current language
   * @return {String}      - Current locale
   */
  getGeneralLanguage() {
    if (/fr/i.test(this.currentLanguage.split('_')[0])) {
      return 'fr';
    }
    return 'en';
  }

  preferredCountry(language) {
    if (_.indexOf(['FR', 'EN'], language.toUpperCase() > -1)) {
      const customLanguage = _.get(this.LANGUAGES.preferred, `${language}.${this.TARGET}`);
      if (customLanguage) {
        return customLanguage;
      }
    }
    return language;
  }

  findLanguage(language, country) {
    const locale = `${language.toLowerCase()}_${country.toUpperCase()}`;
    if (this.availableLangsKeys.indexOf(locale) > -1) {
      return locale;
    }
    // Not found: Try to find another country with same base language
    const similarLanguage = _.find(
      this.availableLangsKeys,
      val => this.localeRegex.test(val) && val.match(this.localeRegex)[1] === language,
    );
    if (similarLanguage) {
      return similarLanguage;
    }
    // Not found
    return this.LANGUAGES.defaultLoc;
  }

  $get() {
    return {
      getUserLocale: locale => this.getUserLocale(locale),
      getGeneralLanguage: () => this.getGeneralLanguage(),
      setUserLocale: min => this.setUserLocale(min),
    };
  }
}

angular.module('managerApp').provider('TranslateService', TranslateServiceProvider);
