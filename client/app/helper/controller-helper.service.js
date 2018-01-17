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

    downloadContent (config) {
        const fileContent = config.content;
        const fileName = config.fileName;

        let charSet = "";
        if (navigator.platform.toUpperCase().indexOf("WIN") > -1) {
            charSet = "charset=windows-1252;base64";
        } else {
            charSet = "charset=utf-8;base64";
        }

        const dataString = btoa(unescape(encodeURIComponent(fileContent)));
        const link = document.createElement("a");
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(new Blob([config.content], { type: `text/plain;${charSet}` }), fileName);
        } else if (link.download !== undefined) {
            link.setAttribute("href", `data:text/plain;${charSet},${dataString}`);
            link.setAttribute("download", fileName);
            link.setAttribute("style", "visibility:hidden");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(`data:text/plain;${charSet},${dataString}`);
        }
    }
}

angular.module("managerApp").service("ControllerHelper", ControllerHelper);
