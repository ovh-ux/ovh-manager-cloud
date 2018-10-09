angular.module('managerApp').directive('autoselect', $timeout => ({
  restrict: 'A',
  link($scope, $element) {
    $timeout(() => {
      $element[0].select();
    });
  },
}));
