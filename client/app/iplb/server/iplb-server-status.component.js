class IpblServerStatusController {
    $onInit () {
        if (!this.server) {
            this.server = {};
        }

        if (this.hasIssue()) {
            this.iconType = "error";
        } else if (this.hasNoInfo()) {
            this.iconType = "help";
        } else {
            this.iconType = "warning";
        }
    }

    hasIssue () {
        return _.some(this.server.serverState || [], serverState => serverState.status === "DOWN");
    }

    hasNoInfo () {
        return !this.server.serverState ||
            this.server.serverState === [] ||
            _.chain(this.server.serverState).map(state => state.status !== "no check").some(Boolean);
    }
}

angular.module("managerApp")
    .component("iplbServerStatus", {
        template: `<cui-status-icon data-type="{{$ctrl.iconType}}"></cui-status-icon>`,
        controller: IpblServerStatusController,
        bindings: {
            server: "<"
        }
    });
