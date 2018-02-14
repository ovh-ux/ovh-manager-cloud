class CloudDownload {
    download (url) {
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

angular.module("managerApp").service("CloudDownload", CloudDownload);
