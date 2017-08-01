angular.module("managerApp").filter("cloudSpaceMeterSpaceLeft", function ($translate) {
    "use strict";
    var template = "<%= used.value %> <%= $t.instant('unit_size_' + used.unit) %>" +
        " / <%= total.value %> <%= $t.instant('unit_size_' + total.unit) %> " +
        "(<%= ratio %>%)";
    return function (usage) {
        return _.template(template)({
            $t: $translate,
            total: usage.size,
            used: usage.used,
            ratio: parseFloat(usage.used.value * 100 / usage.size.value).toFixed(2)
        });
    };
});
