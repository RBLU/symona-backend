FROM circleci/node:8.9.1

ADD https://symona.youpers.com/oracleclient/instantclient-basiclite-linux.x64-12.1.0.2.0.zip .
ADD https://symona.youpers.com/oracleclient/instantclient-sdk-linux.x64-12.1.0.2.0.zip .

RUN sudo apt-get update \
  && sudo apt-get install -y libaio1 build-essential unzip curl

RUN sudo unzip instantclient-basiclite-linux.x64-12.1.0.2.0.zip -d /opt/oracle \
  && sudo unzip instantclient-sdk-linux.x64-12.1.0.2.0.zip -d /opt/oracle  \
  && sudo mv /opt/oracle/instantclient_12_1 /opt/oracle/instantclient \
  && sudo ln -s /opt/oracle/instantclient/libclntsh.so.12.1 /opt/oracle/instantclient/libclntsh.so \
  && sudo ln -s /opt/oracle/instantclient/libocci.so.12.1 /opt/oracle/instantclient/libocci.so

ENV LD_LIBRARY_PATH="/opt/oracle/instantclient"
ENV OCI_HOME="/opt/oracle/instantclient"
ENV OCI_LIB_DIR="/opt/oracle/instantclient"
ENV OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"

RUN echo '/opt/oracle/instantclient/' | sudo tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && sudo ldconfig
