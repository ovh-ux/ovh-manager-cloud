angular.module("managerApp")
.config(function (FlashProvider) {
    "use strict";
    FlashProvider.setTemplatePreset("transclude");
});
