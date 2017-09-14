angular.module("managerApp").service("NashaPartitionZFSOptionsService",
    function ($q, $filter, OvhApiDedicatedNasha, NASHA_ZFS_OPTIONS_DEFAULT) {
        "use strict";
        var self = this;
        self.getZFSOptionsEnums = function () {
            return OvhApiDedicatedNasha.Lexi().schema().$promise
                .then(function (schema) {
                    var enums = {};
                    enums.recordsize = _.chain(schema.models["dedicated.storage.RecordSizeEnum"].enum)
                        .map(function (size) {
                            var int = parseInt(size);
                            return {
                                size: int,
                                label: $filter("bytes")(int, true),
                                isDefault: int === NASHA_ZFS_OPTIONS_DEFAULT.recordsize
                            };
                        })
                        .sortBy("size")
                        .value();

                    enums.sync = _.map(schema.models["dedicated.storage.SyncEnum"].enum, function (option) {
                        return {
                            label: option,
                            warning: option === "disabled",
                            isDefault: option === "standard"
                        };
                    });
                    return enums;
                });
        };

        self.getCurrentZFSOptions = function (nashaId, partitionName) {
            var options = {
                atime: NASHA_ZFS_OPTIONS_DEFAULT.atime === "on",
                recordsize: NASHA_ZFS_OPTIONS_DEFAULT.recordsize,
                sync: NASHA_ZFS_OPTIONS_DEFAULT.sync
            };
            return OvhApiDedicatedNasha.Partition().Options().Lexi().get({
                serviceName: nashaId,
                partitionName: partitionName
            }).$promise
                .then(function (realOptions) {
                    options.atime = realOptions.atime === "on";
                    options.recordsize = parseInt(realOptions.recordsize);
                    options.sync = realOptions.sync;
                    return options;
                })
                .catch(function (err) {
                    if (err.status === 404) {
                        return $q.when(options);
                    }
                    return $q.reject(err);
                });
        };

    });
