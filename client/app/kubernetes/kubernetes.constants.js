angular.module('managerApp')
  .constant('KUBERNETES', {
    // For now only one region is available
    region: 'GRA5',
    deleteConfirmationInput: /^DELETE$/,
    resetConfirmationInput: /^RESET$/,
    kubeconfigFileName: 'kubeconfig',
    loadingStatus: ['INSTALLING', 'DELETING'],
    flavorTypes: ['balanced', 'cpu', 'ram'],
    displayNameMaxLength: 255,
    urls: {
      kubectl: 'https://kubernetes.io/docs/reference/kubectl/overview/',
      kubeconfig: 'https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig',
      kubernetesDoc: 'https://labs.ovh.com/kubernetes-k8s/documentation',
      kubernetesDashboard: 'https://labs.ovh.com/kubernetes-k8s/documentation/dashboard-installation',
    },
  });
