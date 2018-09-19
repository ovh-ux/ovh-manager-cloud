describe('Service: ControllerRequestHelper', () => {
  let $q;
  let $rootScope;

  let ControllerRequestHelper;

  let deferred;

  let initialLoader;

  beforeEach(module('managerAppMock'));

  beforeEach(inject((_$q_, _$rootScope_, _ControllerRequestHelper_) => {
    $q = _$q_;
    $rootScope = _$rootScope_;
    ControllerRequestHelper = _ControllerRequestHelper_;

    deferred = $q.defer();

    initialLoader = {
      loading: false,
      data: [],
      hasErrors: false,
    };
  }));

  describe('Basic features', () => {
    it('should accept an object as config parameter', () => {
      const config = {
        loaderFunction: () => $q.resolve(),
      };
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      spyOn(config, 'loaderFunction').and.callThrough();

      loader.load();
      $rootScope.$apply();

      expect(config.loaderFunction).toHaveBeenCalled();
    });

    it('should accept a function as config parameter', () => {
      const config = jasmine.createSpy('testSpy', () => $q.resolve()).and.callThrough();
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load();
      $rootScope.$apply();

      expect(config).toHaveBeenCalled();
    });

    it('should affect loader object on success', () => {
      const config = () => $q.resolve('success');
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load();
      expect(loader.loading).toEqual(true);

      $rootScope.$apply();

      expect(loader.loading).toEqual(false);
      expect(loader.hasErrors).toEqual(false);
      expect(loader.data).toEqual('success');
    });

    it('should affect loader object on error', () => {
      const config = () => $q.reject('error');
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load();
      expect(loader.loading).toEqual(true);

      $rootScope.$apply();

      expect(loader.loading).toEqual(false);
      expect(loader.hasErrors).toEqual(true);
      expect(loader.data).toEqual([]);
    });
  });

  describe('With legacy callbacks', () => {
    it('should call success callback', () => {
      const config = {
        loaderFunction: () => $q.resolve('success'),
        successHandler: jasmine.createSpy('successSpy', () => null).and.callThrough(),
        errorHandler: jasmine.createSpy('errorSpy', () => null).and.callThrough(),
      };
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load();
      $rootScope.$apply();

      expect(config.successHandler).toHaveBeenCalledWith('success');
      expect(config.errorHandler).not.toHaveBeenCalled();
    });

    it('should call error callback', () => {
      const config = {
        loaderFunction: () => $q.reject('error'),
        successHandler: jasmine.createSpy('successSpy', () => null),
        errorHandler: jasmine.createSpy('errorSpy', () => null),
      };
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load();
      $rootScope.$apply();

      expect(config.successHandler).not.toHaveBeenCalledWith();
      expect(config.errorHandler).toHaveBeenCalledWith('error');
    });
  });

  describe('With promise callbacks', () => {
    it('should return a fulfilled promise', () => {
      const config = () => $q.resolve('success');
      const successHandler = jasmine.createSpy('successSpy', () => null);
      const errorHandler = jasmine.createSpy('errorSpy', () => null);
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load()
        .then(successHandler)
        .catch(errorHandler);
      $rootScope.$apply();

      expect(successHandler).toHaveBeenCalledWith('success');
      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('should return a rejected promise', () => {
      const config = () => $q.reject('error');
      const successHandler = jasmine.createSpy('successSpy', () => null);
      const errorHandler = jasmine.createSpy('errorSpy', () => null);
      const loader = ControllerRequestHelper.getLoader(initialLoader, config);

      loader.load()
        .then(successHandler)
        .catch(errorHandler);
      $rootScope.$apply();

      expect(successHandler).not.toHaveBeenCalledWith();
      expect(errorHandler).toHaveBeenCalledWith('error');
    });
  });
});
