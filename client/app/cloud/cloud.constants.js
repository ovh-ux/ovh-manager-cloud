"use strict";

angular.module("managerApp")
    .constant("CLOUD_INSTANCE_DEFAULTS", {
        region: "WAW1",
        image: "Ubuntu 16.04",
        flavor: "b2-30"
    })
    .constant("CLOUD_INSTANCE_DEFAULT_FALLBACK", {
        region: "WAW1",
        image: "Ubuntu 16.04",
        flavor: "s1-2" })
    .constant("CLOUD_FLAVORTYPE_CATEGORY", [
        {
            id: "vps",
            types: ["ovh.vps-ssd"],
            migrationNotAllowed: [],
            order: 3
        },
        {
            id: "other",
            types: ["ovh.cpu", "ovh.ram", "ovh.ceph.eg", "ovh.ssd.cpu", "ovh.ssd.ram", "ovh.ssd.eg", "ovh.ceph.hg"],
            migrationNotAllowed: ["vps"],
            order: 1
        },
        {
            id: "gpu",
            types: ["ovh.ssd.gpu", "ovh.ssd.gpu2", "ovh.ssd.gpu3"],
            migrationNotAllowed: ["vps"],
            order: 2
        }
    ])
    .constant("CLOUD_FLAVOR_SPECIFIC_IMAGE", [
        "g1",
        "g2",
        "g3"
    ])
    .constant("CLOUD_INSTANCE_CPU_FREQUENCY", {
        "ovh.vps-ssd": 2.4,
        "ovh.cpu": 3.1,
        "ovh.ram": 2.4,
        "ovh.ceph.eg": 2.3,
        "ovh.ssd.ram": 2.4,
        "ovh.ssd.cpu": 3.1,
        "ovh.ssd.eg": 2.3,
        "ovh.ssd.gpu": 3.1,
        "ovh.ssd.gpu2": 3.1,
        "ovh.ssd.gpu3": 3.1
    })
    .constant("CLOUD_INSTANCE_HAS_GUARANTEED_RESSOURCES", [
        "other",
        "gpu"
    ])
    .constant("CLOUD_VOLUME_TYPES", ["classic", "high-speed"])
    .constant("CLOUD_IPFO_ORDER_LIMIT", {
        "ovh.vps-ssd": 16,
        "ovh.cpu": 256,
        "ovh.ram": 256,
        "ovh.ssd.cpu": 256,
        "ovh.ssd.ram": 256,
        "ovh.ssd.eg": 256,
        "ovh.ceph.eg": 256,
        "ovh.ssd.gpu": 256,
        "ovh.ssd.gpu2": 256,
        "ovh.ssd.gpu3": 256
    })
    .constant("CLOUD_GEOLOCALISATION", {
        instance: {
            EU: ["SBG1", "GRA1", "GRA3", "SBG3", "WAW1", "DE1", "UK1"],
            CA: ["BHS1", "BHS3"]
        },
        user: {
            EU: ["CZ", "DE", "ES", "EU", "FI", "FR", "GB", "IE", "IT", "LT", "MA", "NL", "PL", "PT", "SN", "TN"],
            CA: ["ASIA", "AU", "CA", "QC", "SG", "WE", "WS"]
        },
        ipfo: {
            EU: ["BE", "CZ", "DE", "ES", "FI", "FR", "IE", "IT", "LT", "NL", "PL", "PT", "UK"],
            CA: ["CA", "US"]
        }
    })
    .constant("CLOUD_VM_STATE", {
        pending: ["BUILD", "BUILDING", "REBUILD", "DELETING", "RESIZE", "VERIFY_RESIZE", "REVERT_RESIZE", "MIGRATING", "REBOOT", "HARD_REBOOT", "RESCUING", "UNRESCUING", "SNAPSHOTTING", "RESUMING"],
        openstack: ["PAUSED", "STOPPED", "SUSPENDED", "SHUTOFF", "RESCUE"],
        error: ["ERROR"]
    })
    .constant("CLOUD_UNIT_CONVERSION", {
        KILOBYTE_TO_BYTE: 1000,
        MEGABYTE_TO_BYTE: 1000000,
        GIGABYTE_TO_BYTE: 1000000000,
        GIBIBYTE_TO_BYTE: 1073741824
    })
    .constant("CLOUD_MONITORING", {
        alertingEnabled: false,
        vm: {
            upgradeAlertThreshold: 90,
            period: "lastweek",
            type: ["mem:used", "mem:max", "cpu:used", "cpu:max", "net:tx", "net:rx" ]
        }
    })
    .constant("CLOUD_PROJECT_OVERVIEW_THRESHOLD", {
        instances: 15,
        ips: 32
    })
    .constant("CLOUD_PROJECT_STATE", {
        deleting: "deleting",
        deleted: "deleted",
        ok: "ok",
        suspended: "suspended"
    })
    .constant("CLOUD_PCA_FILE_STATE", {
        SEALED: "sealed",
        UNSEALING: "unsealing",
        UNSEALED: "unsealed",
        USERNAME: "pca"
    });
