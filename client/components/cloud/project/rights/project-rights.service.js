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
            return OvhApiCloud.Project().Acl().Lexi().query({
                serviceName: projectId,
                type: "readWrite"
            }).$promise;
        }

        function getCurrentUserNic () {
            return OvhApiMe.Lexi().get().$promise
                .then(function(user) {
                    return user.nichandle;
                });
        }

        function getProjectAdminNic(projectId) {
            return OvhApiCloudProjectServiceInfos.Lexi().get({
                serviceName: projectId
            }).$promise
                .then(function(project) {
                    return project.contactAdmin;
                });
        }
    });
