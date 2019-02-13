class RegionService {
  constructor($translate) {
    this.$translate = $translate;
  }

  static getMacroRegion(region) {
    const macro = /[\D]{2,3}/.exec(region);
    return macro ? macro[0].replace('-', '').toUpperCase() : '';
  }

  getMacroRegionLowercase(region) {
    const macro = this.constructor.getMacroRegion(region);
    return macro ? macro.toLowerCase() : '';
  }

  static getRegionNumber(region) {
    const number = /[\d]+$/.exec(region);
    return number ? number[0] : '';
  }

  getAllTranslatedMacroRegion() {
    return {
      SBG: this.$translate.instant('cloud_common_region_SBG'),
      BHS: this.$translate.instant('cloud_common_region_BHS'),
      GRA: this.$translate.instant('cloud_common_region_GRA'),
      WAW: this.$translate.instant('cloud_common_region_WAW'),
      DE: this.$translate.instant('cloud_common_region_DE'),
      UK: this.$translate.instant('cloud_common_region_UK'),
      US: this.$translate.instant('cloud_common_region_US'),
      SYD: this.$translate.instant('cloud_common_region_SYD'),
      SGP: this.$translate.instant('cloud_common_region_SGP'),
    };
  }

  getTranslatedMacroRegion(region) {
    const translatedMacroRegion = this.$translate.instant(`cloud_common_region_${this.constructor.getMacroRegion(region)}`);
    return translatedMacroRegion || region;
  }

  getTranslatedMicroRegion(region) {
    const translatedMicroRegion = this.$translate.instant(`cloud_common_region_${this.constructor.getMacroRegion(region)}_micro`, {
      micro: region,
    });
    return translatedMicroRegion || region;
  }

  getTranslatedMicroRegionLocation(region) {
    const translatedMicroRegionLocation = this.$translate.instant(`cloud_common_region_location_${this.constructor.getMacroRegion(region)}`);
    return translatedMicroRegionLocation || region;
  }

  getRegionIconFlag(region) {
    return `flag-icon-${this.getMacroRegionLowercase(region)}`;
  }

  getTranslatedRegionContinent(region) {
    const translatedRegionContinent = this.$translate.instant(`cloud_common_region_continent_${this.constructor.getMacroRegion(region)}`);
    return translatedRegionContinent || region;
  }

  getRegionCountry(region) {
    const translatedMicroRegionLocation = this.getTranslatedMicroRegionLocation(region);
    return _.trim(translatedMicroRegionLocation.split('(')[1], ')');
  }

  getRegion(regionParam) {
    let region = regionParam;
    region = region.toUpperCase();
    return {
      macroRegion: {
        code: this.constructor.getMacroRegion(region),
        text: this.getTranslatedMacroRegion(region),
      },
      microRegion: {
        code: region,
        text: this.getTranslatedMicroRegion(region),
      },
      location: this.getTranslatedMicroRegionLocation(region),
      continent: this.getTranslatedRegionContinent(region),
      icon: this.getRegionIconFlag(region),
      country: this.getRegionCountry(region),
    };
  }
}

angular.module('managerApp').service('RegionService', RegionService);
