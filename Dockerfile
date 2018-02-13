FROM hypriot/rpi-node

WORKDIR /usr/src/app

RUN git clone https://github.com/piface/libmcp23s17.git && \
    cd libmcp23s17/ && \
    make && \
    sudo make install

RUN git clone https://github.com/piface/libpifacedigital.git && \
    cd libpifacedigital/ && \
    make && \
    sudo make install

RUN mkdir local_modules && cd local_modules && \
    git clone https://github.com/HoverEpic/node-pifacedigital.git

COPY package*.json .

RUN npm install --save

COPY public_html public
COPY server .

EXPOSE 80
CMD [ "npm", "start" ]