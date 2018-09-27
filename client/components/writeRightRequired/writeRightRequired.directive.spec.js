

describe('Component: elementWithWriteRightRequired', () => {
  let util;

  beforeEach(module('managerAppMock'));

  beforeEach(inject((directiveTestUtil) => {
    util = directiveTestUtil;
  }));

  const templates = {
    elementWithWriteRightRequired: {
      element: '<button id="elementUnderTest" write-right-required>My button</button>',
    },
    elementWithNgIfTrue: {
      element: $('<button id="elementUnderTest" ng-if="true" write-right-required>My button</button>').prependTo('body'),
    },
  };

  describe('directive behavior', () => {
    it("should hide element when user don't have write right", inject(($q, CloudProjectRightService) => {
      spyOn(CloudProjectRightService, 'userHaveReadWriteRights').and
        .returnValue($q.when(false));

      const element = util.compileDirective(templates.elementWithWriteRightRequired);

      expect(element.hasClass('hide')).toEqual(true);
    }));

    it('should not hide element when user have write right', inject(($q, CloudProjectRightService) => {
      spyOn(CloudProjectRightService, 'userHaveReadWriteRights').and
        .returnValue($q.when(true));

      const element = util.compileDirective(templates.elementWithWriteRightRequired);

      expect(element.hasClass('hide')).toEqual(false);
    }));

    it('should overwrite conflicts with ng-if and hide element even if ng-if === true', inject(($q, CloudProjectRightService) => {
      spyOn(CloudProjectRightService, 'userHaveReadWriteRights').and
        .returnValue($q.when(false));

      util.compileDirective(templates.elementWithNgIfTrue);

      expect($('#elementUnderTest').hasClass('hide')).toEqual(true);
    }));
  });
});
