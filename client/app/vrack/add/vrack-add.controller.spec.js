xdescribe('Controller: VrackAddCtrl', () => {
  let $httpBackend;
  let $controller;
  let scope;
  let $rootScope;
  let ToastMock;
  let $translateMock;
  let $stateMock;

  let vrackInfoHandler;
  let orderVrackGetHandler;
  let orderVrackPostHandler;

  const dataTestVrackAdd = {
    orderId: 54762687,
    url: 'https://www.ovh.com/cgi-bin/order/displayOrder.cgi?orderId=54762687&orderPassword=nmgI',
    details: [
      {
        domain: '*',
        totalPrice: {
          currencyCode: 'EUR',
          value: 0,
          text: '0.00 €',
        },
        detailType: 'INSTALLATION',
        quantity: 1,
        unitPrice: {
          currencyCode: 'EUR',
          value: 0,
          text: '0.00 €',
        },
        description: 'Installation du vRack',
      },
    ],
    contracts: [
      {
        name: 'Conditions générales de service',
        url: 'https://www.ovh.com/fr/support/documents_legaux/conditions generales de service.pdf',
        content: 'CONDITIONS GENERALES DE SERVICE\nDernière version en date du 29/11/2013 .........\n\n',
      },
    ],
    prices: {
      withoutTax: {
        currencyCode: 'EUR',
        value: 0,
        text: '0.00 €',
      },
      tax: {
        currencyCode: 'EUR',
        value: 0,
        text: '0.00 €',
      },
      withTax: {
        currencyCode: 'EUR',
        value: 0,
        text: '0.00 €',
      },
    },
  };

  // load the controller"s module
  beforeEach(module('managerAppMock'));

  let controller;

  function initNewCtrl() {
    controller = $controller('VrackAddCtrl', {
      $scope: scope,
      $rootScope,
      Toast: ToastMock,
      $translate: $translateMock,
      $state: $stateMock,
    });
  }

  beforeEach(inject((_$httpBackend_, _$rootScope_, _$controller_, ssoAuthentication) => {
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    ToastMock = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };
    $translateMock = {
      instant: jasmine.createSpy('instant'),
    };
    $stateMock = {
      go: jasmine.createSpy('go'),
    };
    orderVrackGetHandler = $httpBackend.whenGET(/.*?apiv6\/order\/vrack\/new?.*/g).respond(200, dataTestVrackAdd);
    orderVrackPostHandler = $httpBackend.whenPOST(/.*?apiv6\/order\/vrack\/new?.*/g).respond(200, dataTestVrackAdd);

    initNewCtrl();
  }));

  afterEach(inject(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    scope.$destroy();
  }));

  describe('Order vrack POST.', () => {
    it('Should open success toast on success with link to order.', () => {
      controller.addVrack();
      $httpBackend.flush();
      expect(ToastMock.success).toHaveBeenCalled();
    });

    it('Should redirect to /vrack on success.', () => {
      controller.addVrack();
      $httpBackend.flush();
      expect(controller.loaders.validationPending).toBeTruthy();
    });

    it('Should set loading variable until operation is complete.', () => {
      controller.addVrack();
      expect(controller.loaders.loading).toEqual(true);
      $httpBackend.flush();
      expect(controller.loaders.loading).toEqual(false);
    });

    it('Check error handling.', () => {
      orderVrackPostHandler.respond(418, { message: 'this is an error' });
      controller.addVrack();
      expect(controller.loaders.loading).toEqual(true);
      $httpBackend.flush();
      expect(ToastMock.error).toHaveBeenCalled();
      expect(controller.loaders.loading).toEqual(false);
    });
  });

  describe('Order vrack GET.', () => {
    it('Should set loading variable until operation is complete.', () => {
      controller.getVrackContract().finally(() => {
        expect(controller.loaders.loading).toEqual(false);
      });
      expect(controller.loaders.loading).toEqual(true);
      $httpBackend.flush();
    });

    it('Get contract.', () => {
      controller.getVrackContract();
      $httpBackend.flush();
      expect(controller.model.agreements.length).toBeGreaterThan(0);
    });

    it('Check error handling.', () => {
      orderVrackGetHandler.respond(418, { message: 'this is an error' });
      controller.getVrackContract();
      expect(controller.loaders.loading).toEqual(true);
      $httpBackend.flush();
      expect(ToastMock.error).toHaveBeenCalled();
      expect(controller.loaders.loading).toEqual(false);
    });
  });
});
