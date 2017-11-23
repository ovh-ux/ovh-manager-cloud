angular.module("managerApp").filter("pluralize", function ($translate, $log) {
    "use strict";

    function exist (translateId) {
        return $translate.instant(translateId) !== translateId;
    }

    function validateId (id) {
        return exist(id) ? id : undefined;
    }

    return function (translateId, counter, vars) {
        let key;

        counter = parseFloat(counter);

        if (angular.isNumber(counter)) {

            key = validateId([translateId, counter].join("_"));

            if (!key) {
                switch (counter) {
                    case 0:
                        key = validateId([translateId, "zero"].join("_"));
                        break;

                    case 1:
                        key = validateId([translateId, "one"].join("_"));
                        break;

                    default:
                        key = validateId([translateId, "other"].join("_"));
                }
            }
        } else {
            $log.warn("[pluralize] counter must be a number! (%o)", counter);
        }

        _.defaults(vars, { count: counter });

        return $translate.instant(key || translateId, vars || {});
    };
});
