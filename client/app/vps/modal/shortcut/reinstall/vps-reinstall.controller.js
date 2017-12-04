class VpsReinstallCtrl {
    constructor ($scope, $translate, $uibModalInstance, CloudMessage, serviceName, SidebarMenu, VpsReinstallService, VpsService) {
        this.$scope = $scope;
        this.$translate = $translate;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudMessage = CloudMessage;
        this.serviceName = serviceName;
        this.SidebarMenu = SidebarMenu;
        this.VpsReinstallService = VpsReinstallService;
        this.VpsService = VpsService;

        this.loaders = {
            save: false,
            sshKeys: false,
            summary: false,
            template: false
        };

        this.summary = {};
        this.template = {
            value : null,
            language: null,
            softwares: [],
            sshKeys: [],
            sendPassword: true
        };
        this.templates = [];
        this.userSshKeys = null;
    }

    $onInit ()  {
        this.loadSshKeys();
        this.loadSummary();
        this.VpsService.getTaskInError(this.serviceName)
            .then(tasks => this.loadTemplate(tasks))
            .catch(err => this.loadTemplate(err));
    }

    loadTemplate (tasks) {
        this.template.language = null;
        this.loaders.template = true;
        if (!tasks || !tasks.length) {
            this.VpsService.getTemplates(this.serviceName)
                .then(data => { this.templates = data.results })
                .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_polling_fail")))
                .finally(() => { this.loaders.template = false });
        }
    }

    loadSshKeys () {
        this.loaders.sshKeys = true;
        this.VpsReinstallService.getSshKeys()
            .then(data => this.userSshKeys = data)
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinstall_loading_sshKeys_error")))
            .finally(() => { this.loaders.sshKeys = false });
    }

    loadSummary () {
        this.loaders.summary = true;
        this.VpsService.getTabSummary(this.serviceName, true)
            .then(summary => this.summary)
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinstall_loading_summary_error")))
            .finally(() => { this.loaders.summary = false });
    }

    loadPackages (distribution) {
        this.template.packages = this.VpsReinstallService.getPackages(distribution);
    }

    getSoftwareLabel (soft) {
        let result = soft.name;
        if(soft.status !== 'STABLE') {
            result += ' (' + this.$translate.instant('vps_configuration_reinstall_step2_software_status_' + soft.status) + ')';
        }
        return result;
    }

    getSoftwareSummaryList () {
        const names = [];
        if(this.template.database){
            names.push($scope.selectedTemplate.database.name);
        }
        if(this.template.webserver) {
            names.push($scope.selectedTemplate.webserver.name);
        }
        if(this.template.environment) {
            names.push($scope.selectedTemplate.environment.name);
        }
        return names.join(', ');
    }

    getSelectedLanguage () {
        if(this.template.value) {
            return (this.template.value.availableLanguage.length > 1) ? this.template.language : this.template.value.locale;
        }
    }

    getLanguageTraduction(language) {
        return this.$translate.instant("language_"+language);
    }

    isWindows (os) {
        return os && /Windows/.test(os.name);
    }

    confirm () {
        this.loaders.save = true;
        const softIds = [];

        if(this.template.database){
            softIds.push($scope.selectedTemplate.database.id);
        }
        if(this.template.webserver) {
            softIds.push($scope.selectedTemplate.webserver.id);
        }
        if(this.template.environment) {
            softIds.push($scope.selectedTemplate.environment.id);
        }

        this.VpsService.reinstall(
                this.serviceName,
                this.template.value.idTemplate,
                this.getSelectedLanguage(),
                softIds,
                this.template.sshKeys,
                (this.template.sendPassword ? 0 : 1))
            .then(() => {
                this.$uibModalInstance.close();
            })
            .catch(err => this.$uibModalInstance.dismiss(this.$translate.instant("vps_configuration_reinstall_fail")))
            .finally(() => {
                this.loaders.save = false;
                this.CloudMessage.success(this.$translate.instant("vps_configuration_reinstall_success"));
            });

    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("VpsReinstallCtrl", VpsReinstallCtrl);

