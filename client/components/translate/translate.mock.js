

angular.module('translateMock', []);

angular.module('translateMock').run(($httpBackend) => {
  $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
});
