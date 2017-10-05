angular.module("managerApp")
    .constant("PCI_ANNOUNCEMENTS", [{
        type: "info",
        messageId: "cloud_message_pci_de1",
        messageStart: "2017-09-06",
        messageEnd: "2017-10-14",
        hasLinkText: true,
        linkURL: {
            FR: "https://www.ovh.com/fr/public-cloud/instances/datacenters.xml",
            TN: "https://www.ovh.com/tn/public-cloud/instances/datacenters.xml",
            MA: "https://www.ovh.com/ma/public-cloud/instances/datacenters.xml",
            SN: "https://www.ovh.sn/public-cloud/instances/datacenters.xml",
            DE: "https://www.ovh.de/public-cloud/instances/datacenters.xml",
            ES: "https://www.ovh.es/public-cloud/instancias/datacenters.xml",
            WS: "https://www.ovh.com/us/es/public-cloud/instancias/datacenters.xml",
            FI: "https://www.ovh-hosting.fi/public-cloud/instances/datacenters.xml"
        }
    }, {
        type: "info",
        messageId: "cloud_message_pci_g3",
        messageStart: "2017-09-06",
        messageEnd: "2017-10-14",
        linkURL: {
            FR: "https://www.ovh.com/fr/public-cloud/instances/gpu/",
            TN: "https://www.ovh.com/tn/public-cloud/instances/gpu/",
            MA: "https://www.ovh.com/ma/public-cloud/instances/gpu/",
            SN: "https://www.ovh.sn/public-cloud/instances/gpu/",
            DE: "https://www.ovh.de/public-cloud/instances/gpu/",
            ES: "https://www.ovh.es/public-cloud/instancias/gpu/",
            FI: "https://www.ovh-hosting.fi/public-cloud/instances/gpu/",
            CZ: "http://www.ovh.cz/public-cloud/instances/gpu/",
            GB: "http://www.ovh.co.uk/public-cloud/instances/gpu/",
            IT: "http://www.ovh.it/public-cloud/instances/gpu/",
            LT: "http://www.ovh.lt/public-cloud/instances/gpu/",
            NL: "http://www.ovh.nl/public-cloud/instances/gpu/",
            PL: "https://www.ovh.pl/public-cloud/instances/gpu/",
            PT: "https://www.ovh.pt/public-cloud/instances/gpu/",
            ASIA: "https://www.ovh.com/asia/public-cloud/instances/gpu/",
            AU: "https://www.ovh.com.au/public-cloud/instances/gpu/",
            CA: "https://www.ovh.co.uk/public-cloud/instances/gpu/",
            QC: "https://www.ovh.com/fr/public-cloud/instances/gpu/",
            SG: "https://www.ovh.com/sg/public-cloud/instances/gpu/",
            WE: "https://www.ovh.co.uk/public-cloud/instances/gpu/",
            WS: "https://www.ovh.com/us/es/public-cloud/instancias/gpu/",
            US: "https://www.ovh.us/public-cloud/instances/gpu/"
        }
    }
    ]);
