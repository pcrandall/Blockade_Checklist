#! /bin/bash

curDir=$(pwd)
# today=$(date +'%F')
version=$(git describe --tags)
releaseDir=$curDir/releases/$version
mkdir -p $releaseDir/

cp -r ./{css/,js/,lib/,index.html} $releaseDir/
cp ./assets/{favicon.ico,redbean-1.3.com} $releaseDir/
cp ./scripts/{createShortcut.bat,start.bat} $releaseDir/
mv $releaseDir/redbean-1.3.com  $releaseDir/blockadeChecklist.com
cd $releaseDir

zip -r ./blockadeChecklist.com . -x "blockadeChecklist.com"

dist=$releaseDir/dist
mkdir -p $dist

cp ./{start.bat,createShortcut.bat,blockadeChecklist.com,favicon.ico} $dist/
cd $dist
zip $version.zip ./*
