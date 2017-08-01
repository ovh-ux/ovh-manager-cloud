angular.module("managerApp").filter("openStreetMap", function (RegionService) {
    "use strict";
    var regionMap = {
        "GRA": "https://www.openstreetmap.org/?mlat=50.98583&mlon=2.12833#map=3/50.00/0.00",
        "SBG": "https://www.openstreetmap.org/?mlat=48.58333&mlon=7.75000#map=3/50.00/0.00",
        "BHS": "https://www.openstreetmap.org/?mlat=45.31666&mlon=-73.86666#map=3/50.00/-50.00",
        "WAW": "https://www.openstreetmap.org/?mlat=52.23000&mlon=21.01100#map=4/50.00/20.00"
    };

    return function (region) {
        var macroRegion = RegionService.getMacroRegion(region);
        return regionMap[macroRegion];
    };
});
