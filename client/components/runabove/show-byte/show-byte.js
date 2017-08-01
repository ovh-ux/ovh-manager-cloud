angular.module('managerApp').filter('showByte',
[ function () {
	"use strict";

	var one_EB = 1152921504606846976,
		one_PB = 1125899906842624,
		one_TB = 1099511627776,
		one_GB = 1073741824,
		one_MB = 1048576,
		one_KB = 1024;

	return function (bytes) {
		if (bytes >= one_EB) {
			return (bytes / one_EB).toFixed(2) + "EB";
		}
		if (bytes >= one_PB) {
			return (bytes / one_PB).toFixed(2) + "PB";
		}
		if (bytes >= one_TB) {
			return (bytes / one_TB).toFixed(2) + "TB";
		}
		if (bytes >= one_GB) {
			return (bytes / one_GB).toFixed(2) + "GB";
		}
		if (bytes >= one_MB) {
			return (bytes / one_MB).toFixed(2) + "MB";
		}
		if (bytes >= one_KB) {
			return (bytes / one_KB).toFixed(2) + "KB";
		}
		return bytes + "B";
	};
}]);
