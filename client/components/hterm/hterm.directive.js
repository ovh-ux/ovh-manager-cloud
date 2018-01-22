"use strict";

angular.module("managerApp")
    .directive("hterm", hterm => ({
        restrict: "EA",
        scope: {
            sendData: "&",
            sendConfig: "&",
            term: "="
        },
        link: (scope, element) => {

            const term = scope.term || new hterm.Terminal();
            term.getPrefs().set("send-encoding", "raw");

            term.onTerminalReady = function () {
                const io = term.io.push();

                io.onVTKeystroke = function (str) {
                    scope.sendData({ data: str });
                };

                io.sendString = io.onVTKeystroke;

                io.onTerminalResize = function (columns, rows) {
                    scope.sendConfig({ config: {
                        columns,
                        rows
                    } });
                };

                term.installKeyboard();
                scope.term = term;
            };
            term.decorate(element.context);
        }
    }));
