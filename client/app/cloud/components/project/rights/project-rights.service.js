angular.module('managerApp').service('CloudProjectRightService',
  function (OvhApiCloud, OvhApiCloudProjectServiceInfos, OvhApiMe, $q) {
    function getReadWriteAccounts(projectId) {
      return OvhApiCloud.Project().Acl().v6().query({
        serviceName: projectId,
        type: 'readWrite',
      }).$promise;
    }

    function getCurrentUserNic() {
      return OvhApiMe.v6().get().$promise
        .then(user => user.nichandle);
    }

    function getProjectAdminNic(projectId) {
      return OvhApiCloudProjectServiceInfos.v6().get({
        serviceName: projectId,
      }).$promise
        .then(project => project.contactAdmin);
    }

    this.userHaveReadWriteRights = function (projectId) {
      return $q.all({
        readWriteAccounts: getReadWriteAccounts(projectId),
        currentUserNic: getCurrentUserNic(),
        projectAdminNic: getProjectAdminNic(projectId),
      })
        .then(result => result.projectAdminNic === result.currentUserNic
          || _.find(result.readWriteAccounts, nicWrite => nicWrite === result.currentUserNic));
    };
  });
