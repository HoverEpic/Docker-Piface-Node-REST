# Docker-Piface-Node-REST
A simple Docker container for controlling PiFace on RPi

Docker Hub : https://hub.docker.com/r/epicblox/node-piface/

## Sreenshot :
![Screenshot](https://github.com/HoverEpic/Docker-Piface-Node-RPC/raw/master/web-screenshot.png)

## Features :
 - Controle PiFace from web bage
 - Controle PiFace from REST
 - Multi piface support (up to 8)
 - Live update of inputs and outputs

## TODO :
 - write REST doc

## Run :
 - ```sudo modprobe spi-bcm2835``` (or enable SPI from raspi-config)
 - ```docker run --rm \
   --name piface \
   --hostname piface \
   --cap-add ALL \
   -v /lib/modules:/lib/modules \
   -v /sys:/sys \
   -e PIFACE_COUNT=1 \
   --device /dev/spidev-0.0:/dev/spidev-0.0 \
   --device /dev/mem:/dev/mem \
   -p 80:80\
   --privileged -d epicblox/node-piface```

If you have more than 1 PiFace card, you must ajust PIFACE_COUNT and add correct divices in docker run command.

Access test page with http://pi-ip/ in web browser.

## Plans :
 - add websockets for live update
 - make toggle cancel action on fail
 - auth

## Thanks to :
 - http://www.piface.org.uk/guides/Install_PiFace_Software/
 - https://github.com/tualo/node-pifacedigital
 - https://www.npmjs.com/package/express
