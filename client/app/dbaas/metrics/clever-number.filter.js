angular.module("managerApp")
    .filter("metricsCleverNumber", function() {
        return (n) => {
            if (!Number.isInteger(n)) { return n; }

            if (n >= 1000000 && (n % 1000000) === 0) { return `${n / 1000000}M`; }
            if (n >= 1000 && (n % 1000) === 0) { return `${n / 1000}K`; }
            return n;
        };
    });
