class ControllerHelper {
    constructor (ControllerModalHelper, ControllerRequestHelper) {
        this.request = ControllerRequestHelper;
        this.modal = ControllerModalHelper;
    }
}

angular.module("managerApp").service("ControllerHelper", ControllerHelper);
