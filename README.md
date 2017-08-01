# OVH Manager Cloud

![ovh-manager-cloud-banner](cloudBanner.png)

> OVH Control Panel Cloud UI

## Install

### Requirements

* You must have a sane installation of ``nodejs`` (with ``npm``)
* You must have a sane installation of ``bower`` (``npm install -g bower``)
* You must have a sane installation of ``grunt`` (``npm install -g grunt-cli``)

### Install dependencies

```bash
make install
```

## Run in development mode

First you have to activate the developer mode in the [Manager V6](https://www.ovh.com/manager/dedicated/#/useraccount/advanced).

### Generate your certificates

To be able to run manager in dev mode using http2.

```bash
make gen-certificate
```

If you want, you can also generate a certificate by hand:

```bash
mkdir -p server/certificate
openssl genrsa -des3 -out server/certificate/server.key 1024
openssl req -new -key server/certificate/server.key -out server/certificate/server.csr
cp server/certificate/server.key server/certificate/server.key.tmp
openssl rsa -in server/certificate/server.key.tmp -out server/certificate/server.key
openssl x509 -req -days 365 -in server/certificate/server.csr -signkey server/certificate/server.key -out server/certificate/server.crt
rm server/certificate/server.key.tmp
```

A full guide can be found for example [here](https://www.akadia.com/services/ssh_test_certificate.html).

### Launch the manager

```bash
make dev
```

The manager is running on [https://localhost:8181](https://localhost:8181)

And start developing.

## Related links

 * Contribute: https://github.com/ovh-ux/ovh-ux-guidelines/blob/master/.github/CONTRIBUTING.md
 * Report bugs: https://github.com/ovh-ux/ovh-manager-cloud/issues

## License

See https://github.com/ovh-ux/ovh-manager-cloud/blob/master/LICENSE
