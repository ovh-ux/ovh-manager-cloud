angular.module('managerApp').directive('scrollHere', function() {
    "use strict";

    return {
        restrict: 'A',
        link: function(scope, element) {
            var area_to_scroll = element.offset().top - $('nav.user').height() - 50;
            $('html,body').animate({
                scrollTop: area_to_scroll
            }, 1000);
        }
    };
});
