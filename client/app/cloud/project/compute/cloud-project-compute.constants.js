angular.module("managerApp")
    .constant("PCI_ANNOUNCEMENTS", [{
        type: "image",
        messageId: "cloud_message_pci_bandwitdh_xmas",
        messageStart: "2017-12-18",
        messageEnd: "2018-01-08",
        sources: {
            en: "assets/images/announcement/bandwidth/EN_BANNER.png",
            fr: "assets/images/announcement/bandwidth/FR_BANNER.png"
        },
        description: {
            en: "Announcement: From December 19th until January 8th inclusive, get up to 10 GBits/s of network bandwidth (overall) for C2-120, B2-120, R2-240 and G3-120 instances",
            fr: "Annonce: Du 19 décembre au 8 janvier inclus, profitez d'une bande passante réseau allant jusqu'à 10 Gbits/s (au global) pour les instances C2-120, B2-120, R2-240 et G3-120"
        }
    }]);
