"use strict";

angular.module("translateMock", []);

angular.module("translateMock").run(function ($httpBackend) {

    $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});

});
