angular.module('managerApp').directive('smoothScrollHere', $timeout => ({
  restrict: 'A',
  link(scope, element, attrs) {
    const opts = scope.$eval(attrs.smoothScrollHere);
    const delay = (opts && _.isNumber(opts.delay)) ? opts.delay : 500;
    const offset = (opts && _.isNumber(opts.offset)) ? opts.offset : 0;
    let maxRetries = 5;

    function tryScroll() {
      if (element.height()) {
        $('html,body').animate({
          scrollTop: Math.max(0, element.offset().top + offset),
        }, delay);
      } else if (maxRetries > 0) {
        maxRetries -= 1;
        $timeout(tryScroll, 99);
      }
    }

    $timeout(tryScroll, 99);
  },
}));
