describe("Service: ControllerRequestHelper", () => {
    let $q;
    let $rootScope;

    let ControllerRequestHelper;

    let deferred;

    let initialLoader;

    beforeEach(module("managerAppMock"));

    beforeEach(inject((_$q_, _$rootScope_, _ControllerRequestHelper_) => {
        $q = _$q_;
        $rootScope = _$rootScope_;
        ControllerRequestHelper = _ControllerRequestHelper_;

        deferred = $q.defer();

        initialLoader = {
            loading: false,
            data: [],
            hasErrors: false
        };
    }));

    describe("Basic features", () => {
        it("should accept an object as config parameter", () => {
            let config = {
                loaderFunction: () => $q.resolve()
            };
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            spyOn(config, "loaderFunction").and.callThrough();

            loader.load();
            $rootScope.$apply();

            expect(config.loaderFunction).toHaveBeenCalled();
        });

        it("should accept a function as config parameter", () => {
            let config = jasmine.createSpy('testSpy', () => $q.resolve()).and.callThrough();
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            loader.load();
            $rootScope.$apply();

            expect(config).toHaveBeenCalled();
        });

        it("should affect loader object on success", () => {
            let config = () => $q.resolve("success");
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            loader.load();
            expect(loader.loading).toEqual(true);

            $rootScope.$apply();

            expect(loader.loading).toEqual(false);
            expect(loader.hasErrors).toEqual(false);
            expect(loader.data).toEqual("success");
        });

        it("should affect loader object on error", () => {
            let config = () => $q.reject("error");
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            loader.load();
            expect(loader.loading).toEqual(true);

            $rootScope.$apply();

            expect(loader.loading).toEqual(false);
            expect(loader.hasErrors).toEqual(true);
            expect(loader.data).toEqual([]);
        });
    });

    describe("With legacy callbacks", () => {
        it("should call success callback", () => {
            let config = {
                loaderFunction: () => $q.resolve("success"),
                successHandler: jasmine.createSpy("successSpy", () => null).and.callThrough(),
                errorHandler: jasmine.createSpy("errorSpy", () => null).and.callThrough()
            };
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            loader.load();
            $rootScope.$apply();

            expect(config.successHandler).toHaveBeenCalledWith("success");
            expect(config.errorHandler).not.toHaveBeenCalled();
        });

        it("should call error callback", () => {
            let config = {
                loaderFunction: () => $q.reject("error"),
                successHandler: jasmine.createSpy("successSpy", () => null),
                errorHandler: jasmine.createSpy("errorSpy", () => null)
            };
            let loader = ControllerRequestHelper.getLoader(initialLoader, config);

            loader.load();
            $rootScope.$apply();

            expect(config.successHandler).not.toHaveBeenCalledWith();
            expect(config.errorHandler).toHaveBeenCalledWith("error");
        });
    });

    describe("With promise callbacks", () => {
        it("should return a fulfilled promise", () => {
            let config = () => $q.resolve("success");
            let successHandler = jasmine.createSpy("successSpy", () => null);
            let errorHandler = jasmine.createSpy("errorSpy", () => null);
            let loader = ControllerRequestHelper.getLoader(initialLoader, config)

            loader.load()
                .then(successHandler)
                .catch(errorHandler);
            $rootScope.$apply();

            expect(successHandler).toHaveBeenCalledWith("success");
            expect(errorHandler).not.toHaveBeenCalled();
        });

        it("should return a rejected promise", () => {
            let config = () => $q.reject("error");
            let successHandler = jasmine.createSpy("successSpy", () => null);
            let errorHandler = jasmine.createSpy("errorSpy", () => null);
            let loader = ControllerRequestHelper.getLoader(initialLoader, config)

            loader.load()
                .then(successHandler)
                .catch(errorHandler);
            $rootScope.$apply();

            expect(successHandler).not.toHaveBeenCalledWith();
            expect(errorHandler).toHaveBeenCalledWith("error");
        });
    });
});
