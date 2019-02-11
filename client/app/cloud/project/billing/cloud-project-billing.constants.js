export const CLOUD_PROJECT_CONSUMPTION_SUFFIX = /\.consumption.*/;
export const CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION = {
  incomingBandwidth: /^bandwidth_[a-z]+_in*/,
  outgoingBandwidth: /^bandwidth_[a-z]+(_out)?\..*/,
  stored: /^[a-z]+\.consumption.*/,
};

export default {
  CLOUD_PROJECT_CONSUMPTION_SUFFIX,
  CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION,
};

angular.module('managerApp').constant('CLOUD_PROJECT_CONSUMPTION_SUFFIX', CLOUD_PROJECT_CONSUMPTION_SUFFIX);
angular.module('managerApp').constant('CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION', CLOUD_PROJECT_CONSUMPTION_PLANCODE_CONVERSION);
