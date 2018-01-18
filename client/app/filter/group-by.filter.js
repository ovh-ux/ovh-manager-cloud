// Note the 'memoize' call. This underscore method caches the result of the function and stops angular from evaluating the filter expression every time, thus preventing 
// angular from reaching the digest iterations limit.  
// source: https://stackoverflow.com/questions/14800862/how-can-i-group-data-with-an-angular-filter

angular.module("managerApp").filter("groupBy", () => _.memoize((items, field) => _.groupBy(items, field)));
