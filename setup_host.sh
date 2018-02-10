#!/bin/bash

sudo apt-get update
sudo apt-get install automake libtool git
git clone https://github.com/thomasmacpherson/piface.git
cd piface/c
./autogen.sh && ./configure && make && sudo make install
sudo ldconfig
cd ../scripts
# required on master
sudo ./spidev-setup
cd ../../