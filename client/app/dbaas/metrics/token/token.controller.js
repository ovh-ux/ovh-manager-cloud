angular.module("managerApp")
    .controller("DBaasMetricsTokenCtrl", class {

        constructor (Toast, metricsService, $translate) {
            this.Toast = Toast;
            this.srv = metricsService;
            this.t = $translate;
            this.project = {
                tokens: []
            };
            this.newMeta = {
                isRead: true,
                wantLabels: false,
                label: {}
            };

            metricsService.getService()
                .then((service) => {
                    this.service = service;

                    this.emptyNewToken = {
                        labels: [],
                        serviceName: service.name || "",
                        description: ""
                    };

                    this.newToken = angular.copy(this.emptyNewToken);
                    this.tokenLoading = true;

                    metricsService.getTokens()
                        .then((tokens) => {
                            this.tokens = tokens;
                            this.tokenLoading = false;
                        })
                        .catch((err) => {
                            Toast.error(this.t.instant("metrics_token_err_get"), err);
                        });
                });
        }

        addLabel () {
            if (!this.newMeta.label.key ||
                !this.newMeta.label.value) { return; }
            this.newToken.labels.push({
                key: this.newMeta.label.key,
                value: this.newMeta.label.value
            });
            this.newMeta.label.key = "";
            this.newMeta.label.value = "";
            this.focusLabelKey();
        }

        delLabel (i) {
            delete this.newToken.labels.splice(i, 1);
            this.focusLabelKey();
        }

        createToken () {
            this.newToken.permission = this.newMeta.isRead ? "READ" : "WRITE";
            this.addLabel();
            this.srv.addToken(this.newToken)
                .then((res) => {
                    this.Toast.success(this.t.instant("metrics_token_created"));
                    this.tokens.push(res);
                    this.newToken = angular.copy(this.emptyNewToken);
                    this.showCreateToken = false;
                    this.newMeta = {
                        isRead: true,
                        wantLabels: false,
                        label: {}
                    };
                }, (err) => {
                    this.Toast.error(`${this.t.instant("metrics_token_err_create")}: ${err}`);
                });
        }

        updateTokenDescription (t, desc) {
            const token = t;
            token.updating = true;
            this.srv
                .updateToken(token.id, desc)
                .then(() => {
                    token.updating = false;
                    token.edit = false;
                    this.Toast.success(this.t.instant("metrics_token_updated"));
                })
                .catch(() => {
                    token.updating = false;
                    this.Toast.error(this.t.instant("metrics_token_err_update"));
                });
        }

        delToken (t) {
            const token = t;
            token.loading = true;
            this.srv.delToken(token.id)
                .then(() => {
                    this.Toast.success(this.t.instant("metrics_token_revoked"));
                    for (let i = 0; i < this.tokens.length; i++) {
                        if (this.tokens[i].id === token.id) {
                            this.tokens[i].isRevoked = true;
                        }
                    }
                    token.loading = false;
                    token.wantToDelete = false;
                }, (err) => {
                    this.Toast.error(this.t.instant("metrics_token_err_revoke"), err);
                    token.loading = false;
                });
        }

        toggleWantLabels () {
            this.newMeta.wantLabels = !this.newMeta.wantLabels;
            if (this.newMeta.wantLabels) {
                this.focusLabelKey();
            }
        }

        // Force focus on new label field
        focusLabelKey () {
            this.newMeta.labelKeyfocus = true;
        }

        toggleCreateToken () {
            this.showCreateToken = !this.showCreateToken;
        }
  });
