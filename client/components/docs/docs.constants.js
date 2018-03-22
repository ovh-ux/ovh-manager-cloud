angular.module("managerApp")
    .constant("DOCS_ALL_GUIDES", {
        FR: "https://www.ovh.com/fr/support/knowledge/",
        EN: "https://www.ovh.co.uk/community/knowledge/",
        US: "https://support.ovhcloud.com/hc/en-us"
    })
    .constant("DOCS_HOMEPAGE_GUIDES", {
        FR: {
            PROJECT: {
                title: "homepage_type_of_guide_pci",
                list: [{
                    text: "guide_project_1",
                    atInternetClickTag: "TopGuide-PublicCloud-1",
                    href: "https://docs.ovh.com/fr/public-cloud/debuter-avec-public-cloud-premiere-connexion/#etape-3-creer-son-premier-projet-public-cloud"
                }, {
                    text: "guide_project_2",
                    atInternetClickTag: "TopGuide-PublicCloud-2",
                    href: "https://docs.ovh.com/fr/public-cloud/information-concernant-le-mode-de-facturation-cloud/"
                }, {
                    text: "guide_project_3",
                    atInternetClickTag: "TopGuide-PublicCloud-3",
                    href: "https://docs.ovh.com/fr/public-cloud/introduction-aux-instances-et-autres-notions-cloud/"
                }, {
                    text: "guide_project_4",
                    atInternetClickTag: "TopGuide-PublicCloud-4",
                    href: "https://docs.ovh.com/fr/public-cloud/augmenter-le-quota-public-cloud/"
                }, {
                    text: "guide_project_5",
                    atInternetClickTag: "TopGuide-PublicCloud-5",
                    href: "https://docs.ovh.com/fr/public-cloud/creer-un-acces-a-horizon/"
                }, {
                    text: "guide_project_6",
                    atInternetClickTag: "TopGuide-PublicCloud-6",
                    href: "https://docs.ovh.com/fr/public-cloud/demarrer-un-premier-serveur-cloud-en-3-min/"
                }, {
                    text: "guide_project_7",
                    atInternetClickTag: "TopGuide-PublicCloud-7",
                    href: "https://docs.ovh.com/fr/public-cloud/preparer-lenvironnement-pour-utiliser-lapi-openstack/"
                }, {
                    text: "guide_project_8",
                    atInternetClickTag: "TopGuide-PublicCloud-8",
                    href: "https://docs.ovh.com/fr/public-cloud/creer-et-configurer-un-disque-supplementaire-sur-une-instance/"
                }, {
                    text: "guide_project_all",
                    atInternetClickTag: "TopGuide-PublicCloud-all",
                    href: "https://docs.ovh.com/fr/public-cloud/"
                }]
            },
            VPS: {
                title: "homepage_type_of_guide_vps",
                list: [{
                    text: "guide_vps_1",
                    atInternetClickTag: "TopGuide-VPS-1",
                    href: "https://docs.ovh.com/fr/vps/debuter-avec-vps/"
                }, {
                    text: "guide_vps_2",
                    atInternetClickTag: "TopGuide-VPS-2",
                    href: "https://docs.ovh.com/fr/vps/conseils-securisation-vps/"
                }, {
                    text: "guide_vps_3",
                    atInternetClickTag: "TopGuide-VPS-3",
                    href: "https://docs.ovh.com/fr/vps/repartitionner-vps-suite-upgrade/"
                }, {
                    text: "guide_vps_4",
                    atInternetClickTag: "TopGuide-VPS-4",
                    href: "https://docs.ovh.com/fr/vps/utilisation-kvm-sur-vps/"
                }, {
                    text: "guide_vps_5",
                    atInternetClickTag: "TopGuide-VPS-5",
                    href: "https://docs.ovh.com/fr/vps/windows-first-config/"
                }, {
                    text: "guide_vps_6",
                    atInternetClickTag: "TopGuide-VPS-6",
                    href: "https://docs.ovh.com/fr/dedicated/ssh-introduction/"
                }, {
                    text: "guide_vps_7",
                    atInternetClickTag: "TopGuide-VPS-7",
                    href: "https://docs.ovh.com/fr/vps/root-password/"
                }, {
                    text: "guide_vps_8",
                    atInternetClickTag: "TopGuide-VPS-8",
                    href: "https://docs.ovh.com/fr/vps/mode-rescue-vps/"
                }, {
                    text: "guide_vps_all",
                    atInternetClickTag: "TopGuide-VPS-all",
                    href: "https://docs.ovh.com/fr/vps/"
                }]
            }
        },
        EN: {
            PROJECT: {
                title: "homepage_type_of_guide_pci",
                list: [{
                    text: "guide_project_1",
                    atInternetClickTag: "TopGuide-PublicCloud-1",
                    href: "https://docs.ovh.com/gb/en/public-cloud/getting_started_with_public_cloud_logging_in_and_creating_a_project/"
                }, {
                    text: "guide_project_5",
                    atInternetClickTag: "TopGuide-PublicCloud-5",
                    href: "https://docs.ovh.com/gb/en/public-cloud/configure_user_access_to_horizon/"
                }, {
                    text: "guide_project_6",
                    atInternetClickTag: "TopGuide-PublicCloud-6",
                    href: "https://docs.ovh.com/gb/en/public-cloud/start-a-first-cloud-server-within-3-min/"
                }, {
                    text: "guide_project_7",
                    atInternetClickTag: "TopGuide-PublicCloud-7",
                    href: "https://docs.ovh.com/gb/en/public-cloud/prepare_the_environment_for_using_the_openstack_api/"
                }, {
                    text: "guide_project_8",
                    atInternetClickTag: "TopGuide-PublicCloud-8",
                    href: "https://docs.ovh.com/gb/en/public-cloud/create_and_configure_an_additional_disk_on_an_instance/"
                }, {
                    text: "guide_project_all",
                    atInternetClickTag: "TopGuide-PublicCloud-all",
                    href: "https://docs.ovh.com/gb/en/public-cloud/"
                }]
            },
            VPS: {
                title: "homepage_type_of_guide_vps",
                list: [{
                    text: "guide_vps_1",
                    atInternetClickTag: "TopGuide-VPS-1",
                    href: "https://docs.ovh.com/gb/en/vps/getting-started-vps/"
                }, {
                    text: "guide_vps_2",
                    atInternetClickTag: "TopGuide-VPS-2",
                    href: "https://docs.ovh.com/gb/en/vps/tips-for-securing-a-vps/"
                }, {
                    text: "guide_vps_3",
                    atInternetClickTag: "TopGuide-VPS-3",
                    href: "https://docs.ovh.com/gb/en/vps/repartitioning-vps-after-upgrade/"
                }, {
                    text: "guide_vps_4",
                    atInternetClickTag: "TopGuide-VPS-4",
                    href: "https://docs.ovh.com/gb/en/vps/use-kvm-for-vps/"
                }, {
                    text: "guide_vps_5",
                    atInternetClickTag: "TopGuide-VPS-5",
                    href: "https://docs.ovh.com/gb/en/vps/windows-first-config/"
                }, {
                    text: "guide_vps_7",
                    atInternetClickTag: "TopGuide-VPS-7",
                    href: "https://docs.ovh.com/gb/en/vps/root-password/"
                }, {
                    text: "guide_vps_8",
                    atInternetClickTag: "TopGuide-VPS-8",
                    href: "https://docs.ovh.com/gb/en/vps/rescue/"
                }, {
                    text: "guide_vps_all",
                    atInternetClickTag: "TopGuide-VPS-9",
                    href: "https://docs.ovh.com/gb/en/vps/"
                }]
            }
        },
        US: {
            PROJECT: {
                title: "homepage_type_of_guide_pci",
                list: [{
                    text: "guide_project_all",
                    atInternetClickTag: "TopGuide-PublicCloud-all",
                    href: "https://support.ovhcloud.com/hc/en-us"
                }]
            }
        }

    });
