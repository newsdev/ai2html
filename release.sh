#!/bin/bash

VERSION=`node -e 'console.log(require("./package.json").version)'`
TAGNAME="v$VERSION"

# if tag has already been used, don't try to create a new release
if [[ `git tag -l "$TAGNAME"` = "$TAGNAME" ]]
then
	echo "Tag $TAGNAME already exists"
	exit 1
fi

git commit -a -m "$TAGNAME"  # create a new commit if there are uncommitted changes
git tag "$TAGNAME" && \      # use the new version number to tag the current head
git push --tags && \
git push