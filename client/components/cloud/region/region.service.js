class RegionService {
    constructor ($translate) {
        this.$translate = $translate;
    }

    getMacroRegion (region) {
        const macro = /[\D]{2,3}/.exec(region);
        return macro ? macro[0].toUpperCase() : "";
    }

    getMacroRegionLowercase (region) {
        const macro = this.getMacroRegion(region);
        return macro ? macro.toLowerCase() : "";
    }

    getRegionNumber (region) {
        const number = /[\d]+$/.exec(region);
        return number ? number[0] : "";
    }

    getAllTranslatedMacroRegion () {
        return {
            SBG: this.$translate.instant("cloud_common_region_SBG"),
            BHS: this.$translate.instant("cloud_common_region_BHS"),
            GRA: this.$translate.instant("cloud_common_region_GRA"),
            WAW: this.$translate.instant("cloud_common_region_WAW"),
            DE: this.$translate.instant("cloud_common_region_DE"),
            UK: this.$translate.instant("cloud_common_region_UK"),
        };
    }

    getTranslatedMacroRegion (region) {
        const translatedMacroRegion = this.$translate.instant(`cloud_common_region_${this.getMacroRegion(region)}`);
        return translatedMacroRegion || region;
    }

    getTranslatedMicroRegion (region) {
        const translatedMicroRegion = this.$translate.instant(`cloud_common_region_${this.getMacroRegion(region)}_micro`, {
            micro: region
        });
        return translatedMicroRegion || region;
    }

    getTranslatedMicroRegionLocation (region) {
        const translatedMicroRegionLocation = this.$translate.instant(`cloud_common_region_location_${this.getMacroRegion(region)}`);
        return translatedMicroRegionLocation || region;
    }

    getRegionIconFlag (region) {
        return `flag-icon-${this.getMacroRegionLowercase(region)}`;
    }

    getRegionCountry (region) {
        const translatedMicroRegionLocation = this.getTranslatedMicroRegionLocation(region);
        return _.trim(translatedMicroRegionLocation.split("(")[1], ")");
    }

    getRegion (region) {
        region = region.toUpperCase();
        return {
            macroRegion: {
                code: this.getMacroRegion(region),
                text: this.getTranslatedMacroRegion(region)
            },
            microRegion: {
                code: region,
                text: this.getTranslatedMicroRegion(region)
            },
            location: this.getTranslatedMicroRegionLocation(region),
            icon: this.getRegionIconFlag(region),
            country: this.getRegionCountry(region)
        };
    }
}

angular.module("managerApp").service("RegionService", RegionService);
