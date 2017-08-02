class IpLoadBalancerHomeCtrl {
    constructor ($stateParams, $translate, ControllerHelper,
                 IpLoadBalancerActionService, IpLoadBalancerConstant,
                 IpLoadBalancerHomeService, IpLoadBalancerMetricsService,
                 REDIRECT_URLS) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerActionService = IpLoadBalancerActionService;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
        this.IpLoadBalancerMetricsService = IpLoadBalancerMetricsService;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.serviceName = this.$stateParams.serviceName;

        this.initLoaders();
    }

    $onInit () {
        this.configuration.load();
        this.information.load();
        this.subscription.load();

        this.initActions();

        this.metricsList = this.IpLoadBalancerConstant.graphs;
        this.metric = this.metricsList[0];
        this.options = {
            scales: {
                yAxes: [{
                    id: "y-axis-1",
                    type: "linear",
                    ticks: {
                        min: 0
                    }
                }]
            },
            elements: {
                line: {
                    fill: false,
                    borderColor: "#3DD1F0",
                    borderWidth: 4
                },
                point: {
                    radius: 0
                }
            }
        };
        this.loadGraph();
    }

    initLoaders () {
        this.information = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getInformations(this.serviceName)
        });

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName)
        });

        this.subscription = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getSubscription(this.serviceName)
        });
    }

    initActions () {
        this.actions = {
            showFailoverIp: {
                text: this.$translate.instant("common_consult"),
                callback: () => this.IpLoadBalancerActionService.showFailoverIpDetail(this.serviceName),
                isAvailable: () => !this.information.loading && !this.information.hasErrors && this.information.data.failoverIp.length
            },
            showNatIp: {
                text: this.$translate.instant("common_consult"),
                callback: () => this.IpLoadBalancerActionService.showNatIpDetail(this.serviceName),
                isAvailable: () => !this.information.loading && !this.information.hasErrors && this.information.data.natIp.length
            },
            changeName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.nameChange(this.serviceName, () => this.configuration.load()),
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            changeCipher: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.cipherChange(this.serviceName, () => this.configuration.load()),
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            changeOffer: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.offerChange(this.serviceName),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            },
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { serviceName: this.serviceName, serviceType: "IP_LOADBALANCING" }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { serviceName: this.serviceName }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            }
        };
    }

    loadGraph () {
        this.loadingGraph = true;
        this.IpLoadBalancerMetricsService.getData(this.metric, "40m-ago", null, {
            // http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html
            downsample: "5m-sum"
        })
            .then(data => {
                if (data.length && data[0].dps) {
                    this.data = _.values(data[0].dps);
                    this.labels = [];
                    this.data.forEach((value, index) => {
                        this.labels.unshift(`${index * 5}m`);
                    });
                }
            })
            .finally(() => {
                this.loadingGraph = false;
            });

    }

    getGraphTitle (metric) {
        return this.$translate.instant(`iplb_graph_name_${metric}`);
    }
}

angular.module("managerApp").controller("IpLoadBalancerHomeCtrl", IpLoadBalancerHomeCtrl);
