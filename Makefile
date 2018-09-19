#### SYSTEM COMMAND ####
NODE=node
YARN=yarn
GIT=git
CD=cd
ECHO=@echo
TAR=tar -zcf
DEL=rm -rf
MAKE=make
MV=mv
RSYNC=rsync -av --delete --exclude=".git"

#### FOLDERS ####
NODE_DIR=node_modules
DIST_DIR=dist
DIST_EU_DIR=dist-EU
DIST_CA_DIR=dist-CA
DIST_US_DIR=dist-US

#### FILES ####
DIST_TAR=dist.tar.gz
DIST_EU_TAR=dist-EU.tar.gz
DIST_CA_TAR=dist-CA.tar.gz
DIST_US_TAR=dist-US.tar.gz

#### MACRO ####
NAME=`grep -Po '(?<="name": ")[^"]*' package.json`

help:
	$(ECHO) "_____________________________"
	$(ECHO) "$(NAME)"
	$(ECHO) "Copyright (c) OVH SAS."
	$(ECHO) "All rights reserved."
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make clean                                                         => clean the sources"
	$(ECHO) "make install                                                       => install deps"
	$(ECHO) "make dev                                                           => launch the project (development)"
	$(ECHO) "make prod                                                          => launch the project (production) - For testing purpose only"
	$(ECHO) "make test                                                          => launch the tests"
	$(ECHO) "make build                                                         => build the project and generate dist"
	$(ECHO) "make release type=patch|minor|major                                => increment release and commit the source"
	$(ECHO) "_____________________________"

clean:
	$(DEL) $(NODE_DIR)
	$(DEL) $(DIST_DIR)
	$(DEL) $(DIST_TAR)
	$(DEL) $(DIST_EU_DIR)
	$(DEL) $(DIST_CA_DIR)
	$(DEL) $(DIST_US_DIR)
	$(DEL) $(DIST_EU_TAR)
	$(DEL) $(DIST_CA_TAR)
	$(DEL) $(DIST_US_TAR)

install:
	$(YARN) install

dev:
	$(YARN) start

prod:
	$(YARN) build

build: build-eu build-ca build-us
	$(TAR) $(DIST_TAR) $(DIST_EU_TAR) $(DIST_CA_TAR) $(DIST_US_TAR)

build-eu:
	$(YARN) build:eu
	$(MV) $(DIST_DIR) $(DIST_EU_DIR)
	$(TAR) $(DIST_EU_TAR) $(DIST_EU_DIR)

build-ca:
	$(YARN) build:ca
	$(MV) $(DIST_DIR) $(DIST_CA_DIR)
	$(TAR) $(DIST_CA_TAR) $(DIST_CA_DIR)

build-us:
	$(YARN) build:us
	$(MV) $(DIST_DIR) $(DIST_US_DIR)
	$(TAR) $(DIST_US_TAR) $(DIST_US_DIR)

release:
	$(YARN) version $(type) -m "chore: release v%s"

###############
# Tests tasks #
###############

test:
	# $(YARN) test --quiet
	$(ECHO) "TODO: FIX UNIT TESTS"

#############
# Sub tasks #
#############

$(NODE_DIR)/%:
	$(MAKE) install
