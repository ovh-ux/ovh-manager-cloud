class ControllerHelper {
    constructor (ControllerModalHelper, ControllerRequestHelper, ControllerNavigationHelper) {
        this.request = ControllerRequestHelper;
        this.modal = ControllerModalHelper;
        this.navigation = ControllerNavigationHelper;
    }
}

angular.module("managerApp").service("ControllerHelper", ControllerHelper);
