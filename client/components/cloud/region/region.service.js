angular.module("managerApp").service("RegionService",
    function ($translate, $sce) {
        "use strict";

        var self = this;

        self.getMacroRegion = function (region) {
            var macro = /[\D]{3}/.exec(region);
            return macro ? macro[0].toUpperCase() : "";
        };

        self.getMacroRegionLowercase = function (region) {
            var macro = self.getMacroRegion(region);
            return macro ? macro.toLowerCase() : "";
        };

        self.getRegionNumber = function (region) {
            var number = /[\d]+$/.exec(region);
            return number ? number[0] : "";
        };

        self.getTranslatedMacroRegion = function (region) {
            var translatedMacroRegion = $translate.instant("cloud_common_region_" + self.getMacroRegion(region));
            return translatedMacroRegion ? translatedMacroRegion : region;
        };

        self.getTranslatedMicroRegion = function (region) {
            var translatedMicroRegion = $translate.instant("cloud_common_region_" + self.getMacroRegion(region) + "_micro", {
                micro: region
            });
            return translatedMicroRegion ? translatedMicroRegion : region;
        };

        self.getTranslatedMicroRegionLocation = function (region) {
            var translatedMicroRegionLocation = $translate.instant("cloud_common_region_location_" + self.getMacroRegion(region));
            return translatedMicroRegionLocation ? translatedMicroRegionLocation : region;
        };

        self.getRegionIconFlag = function (region) {
            return "flag-icon-" + self.getMacroRegionLowercase(region);
        };

        self.getRegionCountry = function (region) {
            var translatedMicroRegionLocation = self.getTranslatedMicroRegionLocation(region);
            return _.trim(translatedMicroRegionLocation.split("(")[1], ")");
        };

        self.getRegion = function (region) {
            region = region.toUpperCase();
            return {
                macroRegion: {
                    code: self.getMacroRegion(region),
                    text: self.getTranslatedMacroRegion(region)
                },
                microRegion: {
                    code: region,
                    text: self.getTranslatedMicroRegion(region)
                },
                location: self.getTranslatedMicroRegionLocation(region),
                icon: self.getRegionIconFlag(region),
                country: self.getRegionCountry(region)
            };
        }
    });
