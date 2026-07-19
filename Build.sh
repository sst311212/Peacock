#!/bin/sh

if [ `apt list curl jq zip | grep installed -c` -ne 3 ]; then
    sudo apt update -y
    sudo apt install zip jq curl -y
    sh ./Build.sh
    exit
fi

njsVer="$(cat .nvmrc)"

njsName="node-$njsVer-linux-x64"
njsFile="$njsName.tar.xz"
njsLink="https://nodejs.org/dist/$njsVer/$njsFile"
if [ ! -d /usr/local/$njsName ]; then
    curl $njsLink -o $njsFile
    sudo tar -xf ./$njsFile -C /usr/local
    sudo ln -sf /usr/local/$njsName/bin/* /usr/local/bin
    echo "NodeJS-$njsVer installed"
    sh ./Build.sh
    exit
fi

yarn -v > /dev/null
if [ ! $? -eq 0 ]; then
    sudo corepack enable
    sh ./Build.sh
    exit
fi

yarn install --immutable
yarn build
yarn optimize

njsName="node-$njsVer-win-x64"
njsFile="$njsName.zip"
njsLink="https://nodejs.org/dist/$njsVer/$njsFile"
if [ ! -f ./$njsFile ]; then
    curl $njsLink -o $njsFile
    unzip $njsFile
    mkdir nodedist
    cp $njsName/node.exe nodedist/node.exe
    cp $njsName/LICENSE nodedist/LICENSE
fi

peacockVer="$(jq -r '.version' package.json)"
peacockName="Peacock-v$peacockVer"
if [ -d "./$peacockName" ]; then
    rm -rf "./$peacockName/"
    rm "$peacockName.zip"
    rm "$peacockName-linux.zip"
fi

bash ./packaging/ciAssemble.sh
