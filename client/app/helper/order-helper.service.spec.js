describe('Service: OrderHelperService', () => {
  let $q;
  let $rootScope;
  let $uibModal;

  let OrderHelperService;

  let deferred;

  beforeEach(module('managerAppMock'));

  beforeEach(inject((_$q_, _$rootScope_, _$uibModal_, _OrderHelperService_) => {
    $q = _$q_;
    $rootScope = _$rootScope_;
    OrderHelperService = _OrderHelperService_;
  }));

  describe('transformToOrderValues', () => {
    it('should accept simple values', () => {
      const config = { foo: 'bar', baz: 'qux' };
      expect(OrderHelperService.constructor.transformToOrderValues(config))
        .toEqual([{
          label: 'foo',
          values: ['bar'],
        }, {
          label: 'baz',
          values: ['qux'],
        }]);
    });

    it('should accept arrays', () => {
      const config = { foo: 'bar', baz: ['qux', 'quux'] };
      expect(OrderHelperService.constructor.transformToOrderValues(config))
        .toEqual([{
          label: 'foo',
          values: ['bar'],
        }, {
          label: 'baz',
          values: ['qux', 'quux'],
        }]);
    });
  });

  describe('getUrlConfigPart', () => {
    it('should accept config with configuration object', () => {
      const config = { a: 'a', b: 'b', configuration: { foo: 'bar', baz: 'qux' } };
      expect(OrderHelperService.getUrlConfigPart(config))
        .toEqual("products=~(~(a~'a~b~'b~configuration~(~(label~'foo~values~(~'bar))~(label~'baz~values~(~'qux)))))");
    });

    it('should accept config with option object', () => {
      const config = {
        a: 'a',
        b: 'b',
        option: [{
          foo: 'bar',
          configuration: {
            baz: 'qux',
          },
        }],
      };
      expect(OrderHelperService.getUrlConfigPart(config))
        .toEqual("products=~(~(a~'a~b~'b~option~(~(foo~'bar~configuration~(~(label~'baz~values~(~'qux)))))))");
    });

    it('should accept config with option array', () => {
      const config = {
        a: 'a',
        b: 'b',
        option: [[{
          label: 'foo',
          values: ['bar'],
        }, {
          label: 'baz',
          values: ['qux'],
        }]],
      };
      expect(OrderHelperService.getUrlConfigPart(config))
        .toEqual("products=~(~(a~'a~b~'b~option~(~(~(label~'foo~values~(~'bar))~(label~'baz~values~(~'qux))))))");
    });

    it('should accept extra URL parameters', () => {
      const config = { a: 'a', b: 'b', configuration: { foo: 'bar', baz: 'qux' } };
      expect(OrderHelperService.getUrlConfigPart(config, {
        productId: 'test',
      }))
        .toEqual("productId=test&products=~(~(a~'a~b~'b~configuration~(~(label~'foo~values~(~'bar))~(label~'baz~values~(~'qux)))))");
    });

    it('should handle spaces', () => {
      const config = { a: 'a', b: 'b', configuration: { foo: 'bar baz' } };
      expect(OrderHelperService.getUrlConfigPart(config))
        .toEqual("products=~(~(a~'a~b~'b~configuration~(~(label~'foo~values~(~'bar*20baz)))))");
    });
  });
});
