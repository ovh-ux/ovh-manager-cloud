angular.module("managerApp").service("CloudProjectRightService",
    function (OvhApiCloud, OvhApiCloudProjectServiceInfos, OvhApiMe, $q) {

        this.userHaveReadWriteRights = function (projectId) {
            return $q.all({
                    readWriteAccounts: getReadWriteAccounts(projectId),
                    currentUserNic: getCurrentUserNic(),
                    projectAdminNic: getProjectAdminNic(projectId)
                })
                .then(function (result) {
                    return result.projectAdminNic === result.currentUserNic || _.find(result.readWriteAccounts, function (nicWrite) {
                        return nicWrite === result.currentUserNic;
                    });
            });
        };

        function getReadWriteAccounts (projectId) {
            return OvhApiCloud.Project().Acl().v6().query({
                serviceName: projectId,
                type: "readWrite"
            }).$promise;
        }

        function getCurrentUserNic () {
            return OvhApiMe.v6().get().$promise
                .then(function(user) {
                    return user.nichandle;
                });
        }

        function getProjectAdminNic(projectId) {
            return OvhApiCloudProjectServiceInfos.v6().get({
                serviceName: projectId
            }).$promise
                .then(function(project) {
                    return project.contactAdmin;
                });
        }
    });
