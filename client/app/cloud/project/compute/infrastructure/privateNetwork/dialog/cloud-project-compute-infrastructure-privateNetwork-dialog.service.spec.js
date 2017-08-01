describe("CloudProjectComputeInfrastructurePrivateNetworkDialogService service", function () {
    "use strict";

    beforeEach(module("managerAppMock"));

    describe("getNthNetworkAddress", function () {
        var service = null;
        beforeEach(inject(function (CloudProjectComputeInfrastructurePrivateNetworkDialogService) {
            service = CloudProjectComputeInfrastructurePrivateNetworkDialogService;
        }));

        it("should return next network address when n is 1", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.0.0";

            var nextAddress = service.getNthNetworkAddress(subnetAddress, networkAddress, 1);

            expect(nextAddress).toEqual({
                isValid: true,
                message: "",
                address: "192.168.1.0"
            });
        });

        it("should return next network address when n is greater than 255", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.0.0";

            var nextAddress = service.getNthNetworkAddress(subnetAddress, networkAddress, 256);

            expect(nextAddress).toEqual({
                isValid: true,
                message: "",
                address: "192.169.0.0"
            });
        });

        it("should return next network address when subnet is on 27 bits", function () {
            var subnetAddress = "255.255.255.224";
            var networkAddress = "192.168.0.0";

            var nextAddress = service.getNthNetworkAddress(subnetAddress, networkAddress, 1);

            expect(nextAddress).toEqual({
                isValid: true,
                message: "",
                address: "192.168.0.32"
            });
        });

        it("should return next network address when subnet is on 17 bits", function () {
            var subnetAddress = "255.255.128.0";
            var networkAddress = "192.168.0.0";

            var nextAddress = service.getNthNetworkAddress(subnetAddress, networkAddress, 1);

            expect(nextAddress).toEqual({
                isValid: true,
                message: "",
                address: "192.168.128.0"
            });
        });

        it("should return error when n is lower than 1", function () {
            var subnetAddress = "255.255.128.0";
            var networkAddress = "192.168.0.0";

            var data = service.getNthNetworkAddress(subnetAddress, networkAddress, 0);

            expect(data).toEqual({
                isValid: false,
                message: "Number of chunk needs to be at least 1.  Provided: " + 0 + "."
            });
        });

        it("should return error when address is not part of the provided subnet", function () {
            var subnetAddress = "255.255.255.184";
            var networkAddress = "192.168.128.251";

            var data = service.getNthNetworkAddress(subnetAddress, networkAddress, 1);

            expect(data).toEqual({
                isValid: false,
                message: "The provided network address (" + networkAddress + ") is not part of the subnet " + subnetAddress + "."
            });
        });
    });

    describe("splitSubnetIpAddresses", function () {
        var service = null;
        beforeEach(inject(function (CloudProjectComputeInfrastructurePrivateNetworkDialogService) {
            service = CloudProjectComputeInfrastructurePrivateNetworkDialogService;
        }));

        it("should returns valid data when not splitting IP", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.12.0";

            var numberOfChunksNeeded = 1;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.12.2",
                    end: "192.168.12.254",
                    total: 253
                }
            ]);
        });

        it("should returns valid data for a uneven number of IPs when not splitting IP", function () {
            var subnetAddress = "255.255.255.248";
            var networkAddress = "192.168.12.248";

            var numberOfChunksNeeded = 1;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.12.250",
                    end: "192.168.12.254",
                    total: 5
                }
            ]);
        });

        it("should returns valid data for a even splitted IPs", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.12.0";

            var numberOfChunksNeeded = 2;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.12.2",
                    end: "192.168.12.127",
                    total: 126
                },
                {
                    start: "192.168.12.129",
                    end: "192.168.12.254",
                    total: 126
                }
            ]);
        });

        it("should returns valid data for a uneven splitted IPs", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.12.0";

            var numberOfChunksNeeded = 4;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.12.2",
                    end: "192.168.12.64",
                    total: 63
                },
                {
                    start: "192.168.12.66",
                    end: "192.168.12.127",
                    total: 62
                },
                {
                    start: "192.168.12.129",
                    end: "192.168.12.191",
                    total: 63
                },
                {
                    start: "192.168.12.193",
                    end: "192.168.12.254",
                    total: 62
                }
            ]);
        });

        it("should returns valid data for a uneven number of IPs when not splitting IP", function () {
            var subnetAddress = "255.255.255.0";
            var networkAddress = "192.168.12.0";

            var numberOfChunksNeeded = 4;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.12.2",
                    end: "192.168.12.64",
                    total: 63
                },
                {
                    start: "192.168.12.66",
                    end: "192.168.12.127",
                    total: 62
                },
                {
                    start: "192.168.12.129",
                    end: "192.168.12.191",
                    total: 63
                },
                {
                    start: "192.168.12.193",
                    end: "192.168.12.254",
                    total: 62
                }
            ]);
        });

        it("should returns valid data for a even splitted IPs on host that is greater than 8 bits in size", function () {
            var subnetAddress = "255.255.128.0";
            var networkAddress = "192.168.128.0";

            var numberOfChunksNeeded = 2;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);
            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.128.2",
                    end: "192.168.191.255",
                    total: 16382
                },
                {
                    start: "192.168.192.1",
                    end: "192.168.255.254",
                    total: 16382
                }
            ]);
        });

        it("should return an error object when number of possible IPs is lower than the number of chunks needed", function () {
            var subnetAddress = "255.255.255.252";
            var networkAddress = "192.168.128.252";

            var numberOfChunksNeeded = 2;
            var numberOfPossibleIps = 256 - 252 - 4;
            //Max number of IP on 8 bits - number of IPs consumed by the network address - (broadcast address (1) + network address (1)) - number of split.  Total: 0

            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data).toEqual({
                isValid: false,
                message: "Too few possible addresses (" + numberOfPossibleIps + ") for number of chunks (" + numberOfChunksNeeded + ").  At least 1 address is needed per chunk."
            });
        });

        it("should return an error object when provided network address is not part of provided subnet", function () {
            var subnetAddress = "255.255.255.184";
            var networkAddress = "192.168.128.251";
            var numberOfChunksNeeded = 2;

            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data).toEqual({
                isValid: false,
                message: "The provided network address (" + networkAddress + ") is not part of the subnet " + subnetAddress + "."
            });
        });

        it("should not return an error when bytes from networkAdress should be ignored when verifying it's part of the subnet.", function () {
            //Explanation: 255.255.240.0 => 111111111111111111110000 in binary.
            //             192.169.49.0  => ‭11000000‬‭10101001‬‭‭00110001‬‬ in binary.  The 1 at the end is irrelevant to the subnet verification since the last 4 bytes are reserved for hosts.
            //Therefore, no error should be obtained.
            var subnetAddress = "255.255.240.0";
            var networkAddress = "192.169.49.0";
            var numberOfChunksNeeded = 2;

            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data.isValid).toBe(true);
        });

        it("should return an error object when number of chunk is 0", function () {
            var subnetAddress = "255.255.128.0";
            var networkAddress = "192.168.128.0";
            var numberOfChunksNeeded = 0;

            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data).toEqual({
                isValid: false,
                message: "Number of chunk needs to be at least 1.  Provided: " + numberOfChunksNeeded + "."
            });
        });

        it("should return an error object when number of chunk is negative", function () {
            var subnetAddress = "255.255.128.0";
            var networkAddress = "192.168.128.0";
            var numberOfChunksNeeded = -999;

            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data).toEqual({
                isValid: false,
                message: "Number of chunk needs to be at least 1.  Provided: " + numberOfChunksNeeded + "."
            });
        });

        it("should return 1 IP per chunk if number of possible IPs is equal to the number of chunks", function () {
            var subnetAddress = "255.255.255.248";
            var networkAddress = "192.168.128.248";

            var numberOfChunksNeeded = 3;
            var data = service.splitSubnetIpAddresses(subnetAddress, networkAddress, numberOfChunksNeeded);

            expect(data.ipBlocks).toEqual([
                {
                    start: "192.168.128.250",
                    end: "192.168.128.250",
                    total: 1
                },
                {
                    start: "192.168.128.252",
                    end: "192.168.128.252",
                    total: 1
                },
                {
                    start: "192.168.128.254",
                    end: "192.168.128.254",
                    total: 1
                }
            ]);
        });
    });
});