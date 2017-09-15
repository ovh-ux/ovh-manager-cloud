class IpLoadBalancerTaskService {
    constructor ($q, $translate, IpLoadBalancing, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.IpLoadBalancing = IpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getTasks (serviceName) {
        return this.IpLoadBalancing.Task().Lexi().query({ serviceName })
            .$promise
            .then(response => {
                const promises = _.map(response, taskId => this.getTask(serviceName, taskId));
                return this.$q.all(promises);
            })
            .catch(this.ServiceHelper.errorHandler("iplb_task_list_loading_error"));
    }

    getTask (serviceName, taskId) {
        return this.IpLoadBalancing.Task().Lexi().get({ serviceName, taskId })
            .$promise;
    }
}

angular.module("managerApp").service("IpLoadBalancerTaskService", IpLoadBalancerTaskService);
