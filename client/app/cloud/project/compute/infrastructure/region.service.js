class CloudRegionService {

    static addOverQuotaInfos (region, quota) {
        const quotaByRegion = _.find(quota, { region: _.get(region, "microRegion.code") });
        const instanceQuota = _.get(quotaByRegion, "instance", false);
        if (instanceQuota) {
            if (instanceQuota.maxInstances !== -1 && instanceQuota.usedInstances >= instanceQuota.maxInstances) {
                region.disabled = "QUOTA_INSTANCE";
            } else if (instanceQuota.maxRam !== -1 && instanceQuota.usedRAM >= instanceQuota.maxRam) {
                region.disabled = "QUOTA_RAM";
            } else if (instanceQuota.maxCores !== -1 && instanceQuota.usedCores >= instanceQuota.maxCores) {
                region.disabled = "QUOTA_VCPUS";
            }
        }
    }

    static checkSshKey (region, sshKeyRegions) {
        const found = _.indexOf(sshKeyRegions, _.get(region, "microRegion.code"));
        if (!region.disabled && found === -1) {
            region.disabled = "SSH_KEY";
        } else if (region.disabled === "SSH_KEY" && found > -1) {
            delete region.disabled;
        }
    }
}

angular.module("managerApp").service("CloudRegionService", CloudRegionService);
