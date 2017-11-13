/**
 * @ngdoc directive
 * @name directives.directive:kvm
 * @element ANY
 * @requires noVNC
 *
 * @decription
 * Provide a noVNC (KVM) console.
 */
angular.module("managerApp").directive("kvm", function () {
    "use strict";

    return {
        restrict: "E",
        replace: true,
        scope: {
            kvmData: "="
        },
        template : `<div id="noVNC_screen">
                       <div id="noVNC_status_bar" class="noVNC_status_bar">
                           <table border="0" width="100%">
                               <tr>
                                   <td>
                                       <div id="noVNC_status">Loading</div>
                                   </td>
                                   <td style="width:1%">
                                       <div id="noVNC_buttons">
                                           <input type=button value="Ctrl+Alt+Del" id="sendCtrlAltDelButton">
                                       </div>
                                   </td>
                               </tr>
                           </table>
                           <br/>
                       </div>
                       <canvas id="noVNC_canvas" width="640px" height="20px" data-ng-hide="rfbLoading">
                           'Error: Canvas not supported.'
                       </canvas>
                       <div class="row-fluid" data-ng-show="rfbLoading">
                            <div class="span12 loader"></div>
                        </div>
                   </div>`,
        link: function ($scope, element) {

            var unregisterSizeChangedWatch, unregisterInterval;
            $scope.rfb = null;
            $scope.rfbLoading = true;

            /**
             * @doc method
             * @methodOf directives.directive:kvm
             * @name directives.directive:kvm#init
             * @description
             * Initialization of the module.
             */
            function init() {
                if ($scope.rfb) {
                    launchKVM();
                } else {
                    // Load supporting scripts
                    window.INCLUDE_URI = "js/app/libs/noVNC/include/";
                    Util.load_scripts(["webutil.js", "base64.js", "websock.js", "des.js",
                                       "keysymdef.js", "keyboard.js", "input.js", "display.js",
                                       "jsunzip.js", "rfb.js"]);
                    window.onscriptsload = function() {
                        launchKVM();
                    };
                }
            }

            /**
             * @doc method
             * @methodOf directives.directive:kvm
             * @name directives.directive:kvm#launchKVM
             * @description
             * Create a new noVNC instance.
             */
            function launchKVM() {

                // noVNC logs
                WebUtil.init_logging(WebUtil.getQueryVar("logging", "none"));

                if (!$scope.kvmData.host || !$scope.kvmData.port) {
                    updateState($scope.rfb, "failed", "Must specify host and port in URL");
                    return;
                }

                $scope.rfb = new RFB({
                    "target":             document.getElementById("noVNC_canvas"),
                    "encrypt":            WebUtil.getQueryVar("encrypt", true),
                    "repeaterID":         WebUtil.getQueryVar("repeaterID", ""),
                    "true_color":         WebUtil.getQueryVar("true_color", true),
                    "local_cursor":       WebUtil.getQueryVar("cursor", true),
                    "shared":             WebUtil.getQueryVar("shared", true),
                    "view_only":          WebUtil.getQueryVar("view_only", false),
                    "updateState":        updateState
                });

                $scope.rfb.connect($scope.kvmData.host, $scope.kvmData.port, $scope.kvmData.password, "");

                var canvaElement = $("#noVNC_canvas");
                unregisterSizeChangedWatch = $scope.$watch(function() {
                            return {
                                w: canvaElement.width(),
                                h: canvaElement.height()
                            };
                        }, function () {
                            fn(canvaElement);
                            unregisterInterval = window.setInterval(function() {
                                var phase = $scope.$root.$$phase;
                                if(phase === "$apply" || phase === "$digest") {
                                    if(fn && (typeof(fn) === "function")) {
                                        fn(canvaElement);
                                    }
                                } else {
                                    $scope.$apply(function() {
                                        fn(canvaElement);
                                    });
                                }
                            }, 2000);
                        }, true);
                element.find("#sendCtrlAltDelButton").bind("click", sendCtrlAltDel);
            }

            function fn(canvaElement) {
                if(unregisterSizeChangedWatch) {
                    unregisterSizeChangedWatch();
                    unregisterSizeChangedWatch = false;
                }
                if(canvaElement.is(":visible")) {
                    angular.element($("#currentAction .modal-dialog")).css({
                        "width": canvaElement.width() + 20 + "px",
                        "height": canvaElement.height() + 150 + "px"
                    });
                }
            }

            /**
             * @doc method
             * @methodOf directives.directive:kvm
             * @name directives.directive:kvm#updateState
             * @description
             * Update the DOM, depending of the KVM state.
             */
            function updateState(rfb, state, oldstate, msg) {

                var s = document.getElementById("noVNC_status"),
                    sb = document.getElementById("noVNC_status_bar"),
                    cad = document.getElementById("sendCtrlAltDelButton"),
                    level;

                $scope.rfbLoading = true;

                switch (state) {
                case "failed":
                case "fatal":
                    level = "error";
                    break;
                case "normal":
                case "disconnected":
                    level = "normal";
                    $scope.$apply(function () {
                        $scope.rfbLoading = false;
                    });
                    break;
                case "loaded":
                    level = "normal";
                    break;
                default:
                    level = "warn";
                }

                if (state === "normal") {
                    cad.disabled = false;
                } else {
                    cad.disabled = true;
                }

                if (typeof(msg) !== "undefined") {
                    sb.setAttribute("class", "noVNC_status_" + level);
                    s.innerHTML = msg;
                }
            }


            /**
             * @doc method
             * @methodOf directives.directive:kvm
             * @name directives.directive:kvm#sendCtrlAltDel
             * @description
             * Send CTRL+ALT+DEL to KVM.
             */
            function sendCtrlAltDel() {
                $scope.rfb.sendCtrlAltDel();
                return false;
            }

            /**
             * @doc method
             * @methodOf directives.directive:kvm
             * @name directives.directive:kvm#closeConnection
             * @description
             * Says to KVM to disconnect.
             */
            function closeConnection() {
                if($scope.rfb) {
                    if(unregisterSizeChangedWatch) {
                        unregisterSizeChangedWatch();
                        unregisterSizeChangedWatch = false;
                    }
                    if(unregisterInterval) {
                        window.clearInterval(unregisterInterval);
                    }
                    $scope.rfb.disconnect();
                    angular.element($("#currentAction .modal-dialog")).css({
                        "width": "",
                        "height": ""
                    });
                }
            }

            $scope.$watch("kvmData", function (value) {
                if (!("WebSocket" in window || "MozWebSocket" in window)) {
                    updateState($scope.rfb, "failed", "failed", "Your browser does not support WebSockets.");
                    return;
                }

                if (value) {
                    init();
                } else {
                    closeConnection();
                }
            });
        }
    };
});
