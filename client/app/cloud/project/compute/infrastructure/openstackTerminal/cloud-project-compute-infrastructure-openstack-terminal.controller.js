class CloudProjectComputeInfrastructureOpenstackTerminalCtrl {
    constructor () {
        this.test = ["ok"];
        this.ws = null;
        this.term = {};
        this.init();
    }

    init () {
        console.log("test", this.term);
        // TODO Get session ID
        const sessionId = "ea5543e7-f3e8-4ef2-bf29-f9546713f505";
        // TODO forge url
        this.ws = new WebSocket(`wss://217.182.130.225/session/${sessionId}/ws`);
        console.log("websocket created", this.ws);
        // const self = this;
        this.ws.onopen = function (event) {
            console.log("ws open", event);
        };

        this.ws.onmessage = function (event) {
            const data = event.data.slice(1);
            switch (event.data[0]) {
                case "0":
                    console.log("ws message", window.atob(data));
                    self.term.io.writeUTF8(window.atob(data));
                    break;
                case "1":
                    // pong
                    break;
                case "2":
                    var preferences = JSON.parse(data);
                    Object.keys(preferences).forEach(key => {
                        console.log(`Term preferences, setting ${key} = ${preferences[key]}`);
                    });
                    break;
                case "3":
                    var autoReconnect = JSON.parse(data);
                    console.log(`Enabling term reconnect: ${autoReconnect} seconds`);
                    break;
                default : console.log("default switch");
            }
        };

        this.ws.onclose = function (event) {
            console.log("close ws", event);
        };
    }

    send (data) {
        console.log("send data", data);
        // this.term.io.writeUTF8(data);
        if (this.ws) {
            this.ws.send(`0${data}`);
        }
    }

    setConfig (config) {
        console.log("setConfig", config);
    }

    minimize () {
        this.minimized = !this.minimized;
        this.maximized = false;
    }

    maximize () {
        this.maximized = !this.maximized;
        this.minimized = false;
    }
}


angular.module("managerApp").controller("CloudProjectComputeInfrastructureOpenstackTerminalCtrl", CloudProjectComputeInfrastructureOpenstackTerminalCtrl);
