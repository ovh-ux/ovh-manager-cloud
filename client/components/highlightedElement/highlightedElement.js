angular.module('managerApp').directive('highlighedElement', () => ({
  restrict: 'A',
  link($scope, $elem, $attrs) {
    let ids = [];

    $attrs.$observe('highlighedElement', (_ids) => {
      ids = _ids ? _ids.split(',') : [];
    });

    $scope.$on('highlighed-element.show', (e, _ids) => {
      if (!_ids || !ids.length) {
        $elem.addClass('highlighed-element-active');
      } else {
        _ids = _ids.split(','); // eslint-disable-line
        angular.forEach(_ids, (item) => {
          if (~ids.indexOf(item.trim())) {
            $elem.addClass('highlighed-element-active');
          }
        });
      }
    });

    $scope.$on('highlighed-element.hide', (e, _ids) => {
      if (!_ids || !ids.length) {
        $elem.removeClass('highlighed-element-active');
      } else {
        _ids = _ids.split(','); // eslint-disable-line
        angular.forEach(_ids, (item) => {
          if (~ids.indexOf(item.trim())) {
            $elem.removeClass('highlighed-element-active');
          }
        });
      }
    });
  },
}));
