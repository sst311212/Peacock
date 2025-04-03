#!/bin/sh

if [ `apt list curl jq zip | grep installed -c` -ne 3 ]; then
    sudo apt update -y
    sudo apt install zip jq curl -y
fi

if [ ! -f ./nodedist/node.exe ]; then
    curl https://nodejs.org/dist/$(cat .nvmrc)/node-$(cat .nvmrc)-win-x64.zip -o node.zip
    unzip node.zip
    mkdir nodedist
    cp node-$(cat .nvmrc)-win-x64/node.exe nodedist/node.exe
    cp node-$(cat .nvmrc)-win-x64/LICENSE nodedist/LICENSE
fi

node -v > /dev/null
if [ $? -ne 0 ]; then
    njsVer="$(cat .nvmrc)"
    njsLink="https://nodejs.org/dist/$njsVer/node-$njsVer-linux-x64.tar.xz"
    curl $njsLink -o node-$njsVer-linux-x64.tar.xz
    sudo tar -xf ./node-$njsVer-linux-x64.tar.xz -C /usr/local
    sudo ln -sf /usr/local/node-$njsVer-linux-x64/bin/* /usr/local/bin
    echo "NodeJS-$njsVer installed"
    sh ./Build.sh
    exit
fi

yarn -v > /dev/null
if [ $? -ne 0 ]; then
    sudo corepack enable
    sh ./Build.sh
    exit
fi

yarn build
if [ $? -ne 0 ]; then
    yarn install
    sh ./Build.sh
    exit
fi

yarn optimize
bash ./packaging/ciAssemble.sh
