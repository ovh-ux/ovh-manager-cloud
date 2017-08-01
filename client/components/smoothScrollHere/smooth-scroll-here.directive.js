angular.module("managerApp").directive("smoothScrollHere", function($timeout) {
    "use strict";

    return {
        restrict : "A",
        link : function(scope, element, attrs) {
            var opts = scope.$eval(attrs.smoothScrollHere);
            var delay = (opts && _.isNumber(opts.delay)) ? opts.delay : 500;
            var offset = (opts && _.isNumber(opts.offset)) ? opts.offset : 0;
            var maxRetries = 5;

            var tryScroll = function () {
                if (element.height()) {
                    $('html,body').animate({
                        scrollTop: Math.max(0, element.offset().top + offset)
                    }, delay);
                } else if (maxRetries > 0) {
                    maxRetries--;
                    $timeout(tryScroll, 99);
                }
            };

            $timeout(tryScroll, 99);
        }
    };
});
