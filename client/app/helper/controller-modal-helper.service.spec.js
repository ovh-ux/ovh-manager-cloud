describe("Service: ControllerModalHelper", () => {
    let $q;
    let $rootScope;
    let $uibModal;

    let ControllerModalHelper;

    let deferred;

    beforeEach(module("managerAppMock"));

    beforeEach(inject((_$q_, _$rootScope_, _$uibModal_, _ControllerModalHelper_) => {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $uibModal = _$uibModal_;
        ControllerModalHelper = _ControllerModalHelper_;

        deferred = $q.defer();

        spyOn($uibModal, "open")
            .and.returnValue({
                result: deferred.promise
            });
    }));

    describe("No callbacks", () => {
        it("should close modal with success", () => {
            ControllerModalHelper.showModal();
            deferred.resolve();
        });

        it("should close modal with rejection", () => {
            ControllerModalHelper.showModal();
            deferred.reject("bad luck");
        });
    });

    describe("With callbacks", () => {
        let config;

        beforeEach(() => {
            config = {
                successHandler: () => null,
                errorHandler: () => null
            };

            spyOn(config, "successHandler");
            spyOn(config, "errorHandler");
        });

        it("should close modal with success", () => {
            ControllerModalHelper.showModal(config);
            deferred.resolve("YES");
            $rootScope.$apply();

            expect(config.successHandler).toHaveBeenCalledWith("YES");
            expect(config.errorHandler).not.toHaveBeenCalled();
        });

        it("should cancel modal", () => {
            ControllerModalHelper.showModal(config);
            deferred.reject("backdrop click");
            $rootScope.$apply();

            expect(config.successHandler).not.toHaveBeenCalled();
            expect(config.errorHandler).not.toHaveBeenCalled();
        });

        it("should close modal with rejection", () => {
            ControllerModalHelper.showModal(config);
            deferred.reject("NO");
            $rootScope.$apply();

            expect(config.successHandler).not.toHaveBeenCalled();
            expect(config.errorHandler).toHaveBeenCalledWith("NO");
        });
    });
});
