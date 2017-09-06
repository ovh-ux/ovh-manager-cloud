class IpLoadBalancerSslCertificateService {
    constructor ($q, IpLoadBalancing, ServiceHelper) {
        this.$q = $q;
        this.ServiceHelper = ServiceHelper;
        this.Ssl = IpLoadBalancing.Ssl().Lexi();
    }

    getCertificates (serviceName) {
        return this.Ssl.query({ serviceName })
            .$promise
            .then(sslIds => this.$q.all(sslIds.map(sslId => this.getCertificate(serviceName, sslId))))
            .catch(this.ServiceHelper.errorHandler("iplb_ssl_list_error"));
    }

    getCertificate (serviceName, sslId) {
        return this.Ssl.get({ serviceName, sslId })
            .$promise;
    }

    create (serviceName, ssl) {
        return this.Ssl.post({ serviceName }, ssl)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_ssl_add_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_ssl_add_error"));
    }

    update (serviceName, sslId, ssl) {
        return this.Ssl.put({
            serviceName,
            sslId
        }, ssl)
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_ssl_update_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_ssl_update_error"));
    }

    delete (serviceName, sslId) {
        return this.Ssl.delete({
            serviceName,
            sslId
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_ssl_delete_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_ssl_delete_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerSslCertificateService", IpLoadBalancerSslCertificateService);
