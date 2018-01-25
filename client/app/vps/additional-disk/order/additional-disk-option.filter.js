angular.module("managerApp").filter("additionalDiskOptions", function () {
    "use strict";
    return function (additionalDiskOption) {
        additionalDiskOption = additionalDiskOption.replace(/[a-zA-Z]*/, "");
        return additionalDiskOption;
    };
});
