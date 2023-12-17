FROM gitpod/workspace-node

RUN sudo add-apt-repository -y ppa:xtradeb/apps

RUN sudo apt update

RUN sudo apt install -y chromium

ENV CHROME_BIN=/usr/bin/chromium