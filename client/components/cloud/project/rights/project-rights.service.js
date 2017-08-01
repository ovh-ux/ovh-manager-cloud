angular.module("managerApp").service("CloudProjectRightService",
    function (Cloud, CloudProjectServiceInfos, User, $q) {

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
            return Cloud.Project().Acl().Lexi().query({
                serviceName: projectId,
                type: "readWrite"
            }).$promise;
        }

        function getCurrentUserNic () {
            return User.Lexi().get().$promise
                .then(function(user) {
                    return user.nichandle;
                });
        }

        function getProjectAdminNic(projectId) {
            return CloudProjectServiceInfos.Lexi().get({
                serviceName: projectId
            }).$promise
                .then(function(project) {
                    return project.contactAdmin;
                });
        }
    });
