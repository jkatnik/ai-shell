FROM ubuntu:latest

ARG UBUNTU_USER=ubuntu
ARG UBUNTU_PASSWORD=ubuntu

RUN echo $UBUNTU_PASSWORD

RUN apt update && apt install  openssh-server sudo curl -y

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 $UBUNTU_USER

RUN  echo "$UBUNTU_USER:$UBUNTU_PASSWORD" | chpasswd

RUN service ssh start

#USER $UBUNTU_USER

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash && \
    apt-get install nodejs -y && \
    node -v && npm -v

EXPOSE 22

CMD ["/usr/sbin/sshd","-D"]
