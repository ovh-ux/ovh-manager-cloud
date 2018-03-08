#!/bin/bash

########## CUSTOMIZE HERE ##########

CLEAN=0
TYPE="major"
SNAPSHOT=1

########## /CUSTOMIZE HERE ##########

TMP_RELEASE_FILE="gruntRelease.txt"
REGEX='^>> Version bumped to ([0-9]+\.[0-9]+\.[0-9]+).*$'
ERROR=0
CURRENT_BRANCH="$( git branch --no-color 2>/dev/null | grep '*' | sed 's/^\* //' )"

help()
{
    echo "Help:"
    echo "      --clean         : this will execute a make clean before building"
    echo "      --type <TYPE>   : choosen type for release. Variable <TYPE> is patch|minor|major . If not given, a SNAPSHOT will be deployed"
}

parseArguments()
{
    while [ $# -gt 0 ]
    do
        case $1 in
        --clean)
            CLEAN=1
            ;;
        --type)
            shift
            TYPE="$1"
            SNAPSHOT=0
            ;;
        *)
            help
            exit 1
            ;;
        esac
        shift
    done
}


stopIfError()
{
    if [ $ERROR -ne 0 ]
    then
        echo "Error: $ERROR"
        echo "Stopping execution"
        exit $ERROR
    fi
}

extractTag()
{
    # Extract tag from result, delete temp result file
    TAG=$(cat $TMP_RELEASE_FILE | grep -E "$REGEX" | sed -r 's/'"$REGEX"'/\1/' | head -1)

    if [ -z $TAG ] 
    then
        echo "No tag found using regex '$REGEX'"
        exit 1
    fi
    
    if [ $SNAPSHOT -eq 1 ]
    then
        TAG="$TAG-beta"
        sed -r -i 's/("version"\s*:\s*").+(")/\1'$TAG'\2/g' bower.json
        sed -r -i 's/("version"\s*:\s*").+(")/\1'$TAG'\2/g' package.json
    fi
    TAG="v$TAG"
    echo "Will now create tag '$TAG'"
}

clean()
{
    if [ $CLEAN -eq 1 ]
    then
        rm -rf ./node_modules/
    fi
   
    # Clean bower components because it always need to be updated
    rm -rf ./components/
}

build()
{
    if [ $SNAPSHOT -eq 1 ]
    then
        releaseTarget="snapshot"
    else
        releaseTarget="release"
    fi

    grunt --no-color deployToNexus:$releaseTarget
    ERROR=$?
    stopIfError
}


main()
{
    parseArguments $@
    
	clean
    npm install
    
    grunt clean
    grunt --no-color bump-only:$TYPE > "$TMP_RELEASE_FILE"
    ERROR=$?
    cat $TMP_RELEASE_FILE
    stopIfError
    
    extractTag
    rm "$TMP_RELEASE_FILE"

    build

    if [ $SNAPSHOT -eq 1 ]
    then
        # It's a snapshot, should not work on master
        git branch -D jenkins-$TAG
        git checkout -b jenkins-$TAG
        git add .
        git commit -am"$TAG"
        git push origin :jenkins-$TAG
        git push origin jenkins-$TAG
        git tag -f -a "$TAG" -m "$TAG"
        git push --tags -f
        git checkout $CURRENT_BRANCH
    else
        # It's a release, commit and tag
        git add .
        grunt --no-color bump-commit
    fi

}

main $@



