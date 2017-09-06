class IpLoadBalancerGraphCtrl {
    constructor ($stateParams, ControllerHelper, IpLoadBalancerConstant,
                 IpLoadBalancerMetricsService, moment) {
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerConstant = IpLoadBalancerConstant;
        this.IpLoadBalancerMetricsService = IpLoadBalancerMetricsService;
        this.moment = moment;
    }

    $onInit () {
        this.connLoader = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.getData("conn")
        });
        this.reqmLoader = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.getData("reqm")
        });
        this.scales = this.IpLoadBalancerConstant.graphParams;
        this.scale = _.keys(this.scales)[0];

        this.initGraph();
        this.loadGraphs();
    }

    initGraph () {
        this.data = {};
        this.metricsList = this.IpLoadBalancerConstant.graphs;
        this.options = {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    id: "y-axe",
                    type: "linear",
                    ticks: {
                        min: 0,
                        beginAtZero: true
                    }
                }]
            },
            elements: {
                line: {
                    fill: "bottom",
                    backgroundColor: "#59d2ef",
                    borderColor: "#00a2bf",
                    borderWidth: 4
                },
                point: {
                    radius: 0
                }
            }
        };
    }

    loadGraphs () {
        this.connLoader.load();
        this.reqmLoader.load();
    }

    getData (metric) {
        const downsample = this.IpLoadBalancerConstant.graphParams[this.scale].downsample;
        const downsampleAggregation = this.metric === "conn" ? "sum" : "max";

        return this.IpLoadBalancerMetricsService.getData(metric, this.scale, null, {
            downsample: `${downsample}-${downsampleAggregation}`
        })
            .then(data => {
                if (data.length && data[0].dps) {
                    return {
                        data: {
                            data: _.values(data[0].dps),
                            labels: this.humanizeLabels(_.keys(data[0].dps))
                        }
                    };
                }
                return {};
            });
    }

    humanizeLabels (labels) {
        return labels.map(label => this.moment(label, "X").format("MM/DD/YY - HH:mm:ss"));
    }

    onScaleChange () {
        this.loadGraphs();
    }
}

angular.module("managerApp").controller("IpLoadBalancerGraphCtrl", IpLoadBalancerGraphCtrl);
