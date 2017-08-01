class SidebarService {
    constructor ($translate, MANAGER_URLS) {
        this.$translate = $translate;
        this.MANAGER_URLS = MANAGER_URLS;
    }

    getServices (section, products) {
        return _.map(section, serviceType => {
            return _.map(_.get(_.find(products, { name: serviceType.type }), "services"));
        });
    }

    fillSection (section, serviceDescriptors, shouldDisplayViewAllItem, allServices) {
        if (shouldDisplayViewAllItem) {
            this.addViewAllItem(allServices, section);
        }
        _.forEach(allServices, (services, index) => {
            serviceDescriptors[index].provider.loadIntoSection(section, services);
        });
    }

    addViewAllItem (allServices, section) {
        let serviceCount = _.reduce(allServices, (total, services) => {
            return total + services.length;
        }, 0);
        if (serviceCount > 1) {
            section.viewAllItem = {
                title: this.$translate.instant("cloud_sidebar_server_more", { count: serviceCount }),
                url: this.MANAGER_URLS.dedicated,
                target: "_parent"
            };
        }
    }

    getNumberOfServicesPerSection (services) {
        const count = _.flatten(services);
        return count.length;
    };

    addOrder (serviceDescriptor) {
        if (_.isFunction(serviceDescriptor.provider.addOrder)) {
            return serviceDescriptor.provider.addOrder();
        }
    }
}

angular.module("managerApp").service("SidebarService", SidebarService);
