"use strict";

angular.module("managerApp")
.config(function ($compileProvider, $logProvider, CONFIG) {
    // Debug mode and logs are disabled in production
    $compileProvider.debugInfoEnabled(CONFIG.env !== "production");
    $logProvider.debugEnabled(CONFIG.env !== "production");
});
