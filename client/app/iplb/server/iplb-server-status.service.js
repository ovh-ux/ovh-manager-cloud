class IpblServerStatusService {
    hasIssue (server) {
        return _.some(server.serverState || [], serverState => serverState.status === "DOWN");
    }

    hasNoInfo (server) {
        return !server.serverState ||
            server.serverState === [] ||
            _.chain(server.serverState).map(state => state.status !== "no check").some(Boolean);
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
