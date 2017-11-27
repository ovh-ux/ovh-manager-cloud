class ControllerHelper {
    constructor (ControllerModalHelper, ControllerRequestHelper, ControllerNavigationHelper) {
        this.request = ControllerRequestHelper;
        this.modal = ControllerModalHelper;
        this.navigation = ControllerNavigationHelper;
    }

    downloadUrl (url) {
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

angular.module("managerApp").service("ControllerHelper", ControllerHelper);
