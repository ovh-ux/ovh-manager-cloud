class IpblServerStatusController {
    constructor (IpblServerStatusService) {
        this.IpblServerStatusService = IpblServerStatusService;
    }

    $onInit () {
        if (!this.server) {
            this.server = {};
        }

        this.iconType = this.IpblServerStatusService.getStatusIcon(this.server);
    }
}

angular.module("managerApp")
    .component("iplbServerStatus", {
        template: '<cui-status-icon data-type="{{$ctrl.iconType}}"></cui-status-icon>',
        controller: IpblServerStatusController,
        bindings: {
            server: "<"
        }
    });
