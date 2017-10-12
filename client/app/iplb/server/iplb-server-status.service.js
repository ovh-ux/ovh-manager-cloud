class IpblServerStatusService {
    hasIssue (server) {
        return server.probe &&
            _.some(server.serverState || [], serverState => serverState.status === "DOWN");
    }

    hasNoInfo (server) {
        return !server.probe ||
            !server.serverState ||
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
