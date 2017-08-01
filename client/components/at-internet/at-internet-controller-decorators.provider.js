"use strict";
/**
 *  Decorate functions at runtime for at-internet tracking
 **/
angular.module("managerApp")
    .provider("atInternetControllerDecorators", function ($provide) {
        this.decorate = function (config) {
            $provide.decorator("$controller", function ($delegate, atInternet) {

                var getController = function (constructor) {

                    var controller = $delegate.apply(null, arguments);

                    var decorators = getControllerDecorators(constructor);

                    if (decorators) {
                        var isLazyInstantiation = _.get(arguments, [2], false);
                        if (isLazyInstantiation) {
                            return function () {
                                //force controller constructor execution for to decorate functions
                                return getDecoratedController(controller(), decorators);
                            };
                        } else {
                            return getDecoratedController(controller, decorators);
                        }
                    } else {
                        return controller;
                    }
                };

                function getDecoratedController (controllerToDecorate, decorators) {

                    _.forOwn(decorators, function (behavior, functionToDecorate) {

                        var originFunction = controllerToDecorate[functionToDecorate];

                        if (!angular.isFunction(originFunction)) {
                            throw new Error("Specified function to decorate is not a function");
                        }

                        controllerToDecorate[functionToDecorate] = function () {
                            behavior(atInternet, controllerToDecorate, arguments);
                            originFunction.apply(controllerToDecorate, arguments);
                        };
                    });

                    return controllerToDecorate;
                }

                function getControllerDecorators (constructor) {
                    if (_.isString(constructor)) {
                        return config[constructor.split(" ")[0]];
                    } else {
                        return undefined;
                    }
                }

                return getController;
            });
        };

        this.$get = function () {};

    });
