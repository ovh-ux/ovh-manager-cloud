angular.module("managerApp")
    .constant("PCI_ANNOUNCEMENTS", [{
        type: "info",
        messageId: "cloud_message_pci_de1",
        messageStart: "2017-09-06",
        messageEnd: "2017-10-06",
        hasLinkText: true,
        //TODO: link to correct URL
        linkURL: "https://www.ovh.com:23243/fr/public-cloud/instances/datacenters.xml"
    }, {
        type: "info",
        messageId: "cloud_message_pci_uk1",
        messageStart: "2017-10-21",
        messageEnd: "2017-11-14"
    }, {
        type: "info",
        messageId: "cloud_message_pci_g3",
        messageStart: "2017-09-06",
        messageEnd: "2017-10-14",
        linkURL: "https://www.ovh.com/fr/public-cloud/instances/gpu/"
    }
    ]);
