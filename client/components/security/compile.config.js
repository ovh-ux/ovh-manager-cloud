
// @todo One day we need to enable this security.

// angular.module("managerApp").config(function ($compileProvider) {
//     "use strict";
//
//     // SECURITY: authorise only trusted hostname in href and img
//     // @see https://docs.angularjs.org/api/ng/provider/$compileProvider#aHrefSanitizationWhitelist
//     var regex = /^\s*(?:(?:(?:https?|ftp|file|blob):\/\/(?:(?:(?:[^\.\/\?#]+\.)*(?:ovh|(?:ovhtelecom(?=\.fr))|(?:ovh\-hosting(?=\.fi))|soyoustart|kimsufi|runabove|office365\-training|office)\.(?:com|net|org|ovh|co\.uk|com\.tn|cz|de|es|eu|fi|fr|ie|it|lt|ma|nl|pl|pt|sn|uk))|localhost|127\.0\.0\.1)(?:\:\d+)?)|data:image)(?:\/|$)/i;
//
//     $compileProvider.aHrefSanitizationWhitelist(regex);
//     $compileProvider.imgSrcSanitizationWhitelist(regex);
//
// });
