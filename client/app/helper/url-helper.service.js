(() => {

    class UrlHelper {

        findUrl (item, type) {
            let url = "";
            if (!item || !item.urls) {
                return url;
            }
            for (let i = 0; i < item.urls.length; i++) {
                if (item.urls[i].type === type) {
                    url = item.urls[i].address;
                    break;
                }
            }
            return url;
        }
    }

    angular.module("managerApp").service("UrlHelper", UrlHelper);
})();
