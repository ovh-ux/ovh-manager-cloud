class IpLoadBalancerSslCertificateOrderCtrl {
    constructor ($stateParams, CloudMessage, IpLoadBalancerConstant, OrderHelperService) {
        this.$stateParams = $stateParams;
        this.CloudMessage = CloudMessage;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.OrderHelperService = OrderHelperService;
    }

    $onInit () {
        this.sslTypes = this.IpLoadBalancerConstant.sslTypes;
        this.organizationTypes = this.IpLoadBalancerConstant.organisationTypes;

        this.urlJson = JSURL.parse("~(~(planCode~'sslgateway-free~duration~'P1M~configuration~(~(label~'domainname~values~(~'test))~(label~'backendserver~values~(~'1.2.3.4)))~option~(~)~quantity~1~productId~'sslGateway))");

        this.newSsl = {
            type: this.sslTypes[0]
        };
    }

    order () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = true;

        let orderConfig;
        if (this.newSsl.type === "ev") {
            orderConfig = this.IpLoadBalancerConstant.sslOrders.comodoEv;
        } else if (this.newSsl.type === "dv") {
            orderConfig = this.IpLoadBalancerConstant.sslOrders.comodoDv;
        } else if (this.newSsl.type === "free") {
            orderConfig = this.IpLoadBalancerConstant.sslOrders.free;
        }

        orderConfig.configuration = {
            domainname: this.newSsl.displayName,
            backendserver: this.newSsl.fqdn
        };

        if (this.newSsl.type === "ev") {
            orderConfig.option[0].configuration = this.newSsl.option;
            orderConfig.option[0].configuration.commonName = this.newSsl.displayName;
            orderConfig.option[0].configuration.dcv_email = this.newSsl.option.email;
            orderConfig.option[0].configuration.country = this.newSsl.option.countryName;
        }

        return this.OrderHelperService.openExpressOrderUrl(orderConfig);
    }
}

angular.module("managerApp").controller("IpLoadBalancerSslCertificateOrderCtrl", IpLoadBalancerSslCertificateOrderCtrl);
