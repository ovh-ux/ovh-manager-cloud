(() => {
    "use strict";

    //See https://interne.ovh.net/confluence/pages/viewpage.action?pageId=45450738
    const cloudApplicationList = [
        "docker",
        "plesk",
        "kubernetes",
        "swarm",
        "cozycloud",
        "wordpress",
        "prestashop",
        "lamp",
        "cassandra",
        "hadoop",
        "mongodb",
        "elasticsearch",
        "gitlab",
        "cpanel",
        "spark",
        "postgre",
        "owncloud",
        "sqlserver",
        "ansible",
        "rancheros",
        "routeros",
        "joomla",
        "drupal",
        "mariadb",
        "kafka",
        "hbase",
        "marathon",
        "mesos",
        "pfsense",
        "opensuse",
        "dcos",
        "openvpn",
        "vestacp",
        "virtualmin",
        "jupyter"
    ];

    class CloudImageService {

        augmentImage (image) {
            if (!image) {
                return null;
            }
            let augmentedImage = _.cloneDeep(image);

            if (_.includes(augmentedImage.tags, "application")) {
                augmentedImage.apps = true;
                augmentedImage.applications = _.intersection(augmentedImage.tags, cloudApplicationList);
            } else {
                augmentedImage.apps = false;
            }
            if (image.flavorType) {
                augmentedImage.flavorType = image.flavorType.split(",");
            }
            return augmentedImage;
        }
    }

    angular.module("managerApp").service("CloudImageService", CloudImageService);
})();
