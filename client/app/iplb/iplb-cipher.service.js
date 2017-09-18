class IpLoadBalancerCipherService {
    constructor ($translate, OvhApiIpLoadBalancing, ServiceHelper) {
        this.$translate = $translate;
        this.IpLoadBalancing = OvhApiIpLoadBalancing;
        this.ServiceHelper = ServiceHelper;
    }

    getCipher (serviceName) {
        return this.IpLoadBalancing.Lexi().get({ serviceName })
            .$promise
            .then(response => this.transformCipher(response.sslConfiguration))
            .catch(this.ServiceHelper.errorHandler("iplb_modal_cipher_change_loading_error"));
    }

    getCipherTypes () {
        return this.IpLoadBalancing.Lexi().schema()
            .$promise
            .then(response => {
                const types = response.models["ipLoadbalancing.SslConfigurationEnum"].enum;
                const mappedTypes = _.map(types, type => this.transformCipher(type));

                return mappedTypes;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_modal_cipher_change_loading_error"));
    }

    transformCipher (cipher) {
        return {
            type: cipher,
            displayName: cipher ? this.$translate.instant(`iplb_modal_cipher_change_cipher_${cipher}_title`) : "-",
            description: cipher ? this.$translate.instant(`iplb_modal_cipher_change_cipher_${cipher}_description`) : null
        };
    }

    updateCipher (serviceName, newCipher) {
        return this.IpLoadBalancing.Lexi().put({ serviceName }, { sslConfiguration: newCipher })
            .$promise
            .then(response => response)
            .catch(this.ServiceHelper.errorHandler("iplb_modal_cipher_change_updating_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerCipherService", IpLoadBalancerCipherService);
