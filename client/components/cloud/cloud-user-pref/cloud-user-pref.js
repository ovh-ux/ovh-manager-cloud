angular.module('managerApp').service('CloudUserPref',
  function ($q, ovhUserPref) {
    this.get = function (key) {
      if (_.isString(key)) {
        return ovhUserPref
          .getValue(key.toUpperCase())
          .then(data => $q.when(data || {}), () => ({}));
      }
      return $q.reject('UserPref key must be of type String');
    };

    this.set = function (key, value) {
      // We do it asynchronously and assume everything is ok.
      if (_.isString(key)) {
        return ovhUserPref.assign(key.toUpperCase(), value || {}).then(() => $q.when(value));
      }
      return $q.reject('UserPref key must be of type String');
    };
  });
