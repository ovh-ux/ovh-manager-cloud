angular.module("managerApp")
    .filter("metricsTokenFilter", function() {
        return (tokens, showRevoked) => {
            if (!tokens) { return; }
            const out = [];
            for (const token of tokens) {
                if (!token.isRevoked || showRevoked) {
                    out.push(token);
                }
            }
            return out;
        };
    });
