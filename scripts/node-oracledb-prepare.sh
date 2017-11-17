#!/usr/bin/env bash
set -e


if [ -e  /home/circleci/repo/.oracle/instantclient/libclntsh.so ]; then
    echo oracle instant client: using cached version
else
    mkdir -p ~/repo/.oracle
    cd ~/repo/.oracle
    wget --no-check-certificate https://symona.youpers.com/oracleclient/instantclient-basiclite-linux.x64-12.1.0.2.0.zip
    wget --no-check-certificate https://symona.youpers.com/oracleclient/instantclient-sdk-linux.x64-12.1.0.2.0.zip
    unzip instantclient-basiclite-linux.x64-12.1.0.2.0.zip
    unzip instantclient-sdk-linux.x64-12.1.0.2.0.zip
    mv instantclient_12_1 instantclient
    cp ~/repo/.oracle/instantclient/libocci.so.12.1 ~/repo/.oracle/instantclient/libocci.so
    cp ~/repo/.oracle/instantclient/libclntsh.so.12.1 ~/repo/.oracle/instantclient/libclntsh.so
fi