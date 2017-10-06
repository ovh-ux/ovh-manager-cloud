class CloudDbStatusIcon {
    constructor () {
        this.statusToIcon = {
            creating: "warning",
            deleting: "warning",
            reopening: "warning",
            restarting: "warning",
            running: "success",
            starting: "warning",
            stopped: "error",
            stopping: "warning",
            suspended: "error",
            suspending: "warning",
            updating: "warning"
        };

        return status => this.format(status);
    }

    format (status) {
        return this.statusToIcon[status];
    }

    static filter () {
        CloudDbStatusIcon.instance = new CloudDbStatusIcon();
        return CloudDbStatusIcon.instance;
    }
}

angular.module("managerApp").filter("CloudDbStatusIcon", CloudDbStatusIcon.filter);
