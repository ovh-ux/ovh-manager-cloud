class CloudProjectComputeInfrastructurePrivateNetworkDialogService {
    constructor ($timeout, CloudProjectNetworkPrivate, CloudProjectComputeInfrastructurePrivateNetworkService) {
        this.$timeout = $timeout;
        this.CloudProjectNetworkPrivate = CloudProjectNetworkPrivate;
        this.Service = CloudProjectComputeInfrastructurePrivateNetworkService;
    }

    fetchPrivateNetworks (serviceName) {
        return this.Service.fetchPrivateNetworks(serviceName);
    }

    arePrivateNetworksLoading () {
        return this.Service.arePrivateNetworksLoading();
    };

    fetchPrivateNetwork (serviceName, id) {
        return this.Service.fetchPrivateNetwork(serviceName, id);
    }

    isPrivateNetworkLoading () {
        return this.Service.isPrivateNetworkLoading();
    }

    fetchRegions (serviceName) {
        return this.Service.fetchRegions(serviceName);
    }

    areRegionsLoading = function () {
        return this.Service.areRegionsLoading();
    }

    fetchUrls () {
        return this.Service.fetchUrls();
    }

    areUrlsLoading = function () {
        return this.Service.areUrlsLoading();
    }

    getUrls = function () {
        return this.Service.getUrls;
    }

    isIPv4 (address) {
        return /^(\d{1,3}\.){3,3}\d{1,3}$/.test(address);
    }

    savePrivateNetwork (projectId, privateNetwork, onSuccess) {
        return this.Service.savePrivateNetwork(projectId, privateNetwork, onSuccess);
    }

    pollPrivateNetworkStatus (options, onSuccess, onFailure) {
        this.$timeout(() => {
            if (this.isPrivateNetworkLoading()) {
                return;
            }

            this.CloudProjectNetworkPrivate.Lexi().resetCache();

            this.fetchPrivateNetwork(
                options.serviceName,
                options.privateNetworkId
            ).then(network => {
                if (this.areAllRegionsActive(network)) {
                    onSuccess(network, options);
                } else {
                    this.pollPrivateNetworkStatus(options, onSuccess, onFailure);
                }
            }).catch(error => onFailure(error));
        }, options.delay || 2000);
    }

    saveSubnet (projectId, networkId, subnet) {
        return this.Service.saveSubnet(projectId, networkId, subnet);
    }

    isSavePending () {
        return this.Service.isSavePending();
    }

    getConstraints () {
        return this.Service.getConstraints();
    };

    areAllRegionsActive (network) {
        return this.Service.areAllRegionsActive(network);

    }

    splitSubnetIpAddresses (networkMask, networkAddress, numberOfChunk) {
        const splitData = this.getIpSplitData(networkMask, networkAddress, numberOfChunk);
        const data = this.validateSplitData(splitData);

        if (!data.isValid) {
            return data;
        }

        const chunks = [];

        //When incrementing the initialIp we always skip 1 IP that will act as the network address for the IPs block.
        const ipBlockIncrement = 2;
        let initialIp = splitData.hostAddressInteger + ipBlockIncrement;
        for (let i = 0; i < numberOfChunk; i++) {
            const start = initialIp;
            let end = start + splitData.chunkSize - 1;

            //If i is an uneven number, and if we have extras, we distribute one extra.
            if (splitData.extras && i % 2 !== 1) {
                end++;
                splitData.extras--;
            }

            chunks.push({
                start: this.convertIpIntToIpString(start),
                end: this.convertIpIntToIpString(end),
                total: end - start + 1
            });

            initialIp = end + ipBlockIncrement;
        }

        return {
            isValid: true,
            message: "",
            ipBlocks: chunks
        };
    }

    getNthNetworkAddress (networkMask, networkAddress, n) {
        const data = this.validateNetworkData(networkMask, networkAddress, n);
        if (!data.isValid) {
            return data;
        }

        const hostBitNumber = this.getNumberOfBitAllocatedToHost(networkMask);
        const shift = hostBitNumber;
        const shiftedHostAdressInteger = parseInt(this.convertIpToByteString(networkAddress), 2) >>> shift;

        return {
            isValid: true,
            message: "",
            address: this.convertIpIntToIpString((shiftedHostAdressInteger + n) << shift)
        };
    }

    validateNetworkData (networkMask, networkAddress, n) {
        let isValid = true;
        let message = "";

        if (this.isAdressPartOfSubnet(networkMask, networkAddress)) {
            isValid = false;
            message = "The provided network address (" + networkAddress + ") is not part of the subnet " + networkMask + ".";
        } else if (n < 1) {
            isValid = false;
            message = "Number of chunk needs to be at least 1.  Provided: " + n + ".";
        }

        return {
            isValid: isValid,
            message: message
        };
    }

    getIpSplitData (networkMask, networkAddress, numberOfChunk) {
        const hostAddressInteger = parseInt(this.convertIpToByteString(networkAddress), 2);
        const networkMaskInteger = parseInt(this.convertIpToByteString(networkMask), 2);

        const lastHostBit = this.getNumberOfBitAllocatedToHost(networkMask, networkAddress);

        //Number of total IPs for number of bit available - 1 IP for network address - 1 IP for broadcast address - numberOfChunk.
        const numberOfUsableIps = Math.pow(2, lastHostBit) - 2 - numberOfChunk;
        const chunkSize = Math.floor(numberOfUsableIps / numberOfChunk);
        const extras = numberOfUsableIps % numberOfChunk;

        return {
            networkMask: networkMask,
            networkAddress: networkAddress,
            hostAddressInteger: hostAddressInteger,
            networkMaskInteger: networkMaskInteger,
            lastHostBit: lastHostBit,
            numberOfChunk: numberOfChunk,
            chunkSize: chunkSize,
            numberOfUsableIps: numberOfUsableIps,
            extras: extras
        };
    }

    validateSplitData (splitData) {
        let isValid = true;
        let message = "";

        if (splitData.numberOfChunk <= 0) {
            isValid = false;
            message = "Number of chunk needs to be at least 1.  Provided: " + splitData.numberOfChunk + ".";
        } else if (this.isAdressPartOfSubnet(splitData.networkMask, splitData.networkAddress)) {
            isValid = false;
            message = "The provided network address (" + splitData.networkAddress + ") is not part of the subnet " + splitData.networkMask + ".";
        } else if (splitData.numberOfChunk > splitData.numberOfUsableIps) {
            isValid = false;
            message = "Too few possible addresses (" + splitData.numberOfUsableIps + ") for number of chunks (" + splitData.numberOfChunk + ").  At least 1 address is needed per chunk.";
        }

        return {
            isValid: isValid,
            message: message
        };
    }

    isAdressPartOfSubnet (networkMask, networkAddress) {
        const hostBitNumber = this.getNumberOfBitAllocatedToHost(networkMask);
        const hostAddressInteger = parseInt(this.convertIpToByteString(networkAddress), 2);
        const networkMaskInteger = parseInt(this.convertIpToByteString(networkMask), 2);


        const shiftedHostAdressInteger = hostAddressInteger >>> hostBitNumber;
        const shiftedNoetworkMaskInteger = networkMaskInteger >>> hostBitNumber;

        //Common way to see if an IP is part of a submask.  submask & (bitwise and) ipAddress should equal ipAddress if the IP is part of the submask.
        let bitWiseComparison = shiftedHostAdressInteger & shiftedNoetworkMaskInteger;
        bitWiseComparison = bitWiseComparison > 0 ? bitWiseComparison : bitWiseComparison >>> 0; //If the result is a negative integer, we shift it to unsigned int.

        return bitWiseComparison !== shiftedHostAdressInteger;
    }

    convertIpIntToIpString (int) {
        const part1 = int & 255;
        const part2 = ((int >> 8) & 255);
        const part3 = ((int >> 16) & 255);
        const part4 = ((int >> 24) & 255);

        return part4 + "." + part3 + "." + part2 + "." + part1;
    }

    getNumberOfBitAllocatedToHost (networkMask, networkAddress) {
        const lastHostMaskBit = this.convertIpToByteString(networkMask, true).indexOf(1);
        if (!networkAddress) {
            return lastHostMaskBit;
        }

        const hostAddressBytes = this.convertIpToByteString(networkAddress, true);
        const lastHostAddressBit = hostAddressBytes.indexOf(1);

        let lastHostBit = 0;
        if (lastHostMaskBit > lastHostAddressBit) {
            lastHostBit = lastHostAddressBit;
        } else {
            lastHostBit = lastHostMaskBit;
        }

        return lastHostBit;
    }

    convertIpToByteString (ip, reverse) {
        const ipParts = ip.split(".");
        let byteString = "";
        for (let i = 0; i < ipParts.length; i++) {
            byteString = byteString + _.padLeft(parseInt(ipParts[i]).toString(2), 8, "0");
        }

        if (reverse) {
            return byteString.split("").reverse().join("");
        } else {
            return byteString;
        }
    }

}

angular.module("managerApp").service("CloudProjectComputeInfrastructurePrivateNetworkDialogService",
    CloudProjectComputeInfrastructurePrivateNetworkDialogService);
