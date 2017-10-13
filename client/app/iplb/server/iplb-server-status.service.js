class IpblServerStatusService {
    hasIssue (server) {
        return server.probe &&
            server.serverState &&
            server.serverState.length &&
            _.get(_.last(_.sortBy(server.serverState), "checkTime"), "status") === "DOWN";
    }

    hasNoInfo (server) {
        return !server.probe ||
            !server.serverState ||
            server.serverState.length === 0 ||
            _.get(_.last(_.sortBy(server.serverState), "checkTime"), "status") === "no check";
    }

    getStatusIcon (server) {
        if (this.hasIssue(server)) {
            return "error";
        }

        if (this.hasNoInfo(server)) {
            return "help";
        }

        return "success";
    }
}

angular.module("managerApp")
    .service("IpblServerStatusService", IpblServerStatusService);
