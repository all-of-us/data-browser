FROM ubuntu:22.04
#
# Development requirements
#

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
     openjdk-17-jdk \
     curl \
     python2 \
     python3 \
     gcc \
     bash \
     openssh-client \
     git \
     gettext \
     mysql-server \
     mysql-client \
     ruby \
     ruby-dev \
     ruby-json \
     make \
     unzip \
     wait-for-it \
     && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV CLOUD_SDK_VERSION 503.0.0

ENV PATH /google-cloud-sdk/bin:$PATH

RUN curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    tar xzf google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    rm google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    ln -s /lib /lib64 && \
    gcloud config set core/disable_usage_reporting true && \
    gcloud config set component_manager/disable_update_check true && \
    gcloud config set metrics/environment github_docker_image

#
# Other development tools
#

RUN gcloud components install app-engine-java

#
# Other development tools
#
RUN gcloud components update
RUN gcloud components install app-engine-java

RUN curl https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 \
  > /usr/local/bin/cloud_sql_proxy && chmod +x /usr/local/bin/cloud_sql_proxy

RUN curl https://raw.githubusercontent.com/mrako/wait-for/d9699cb9fe8a4622f05c4ee32adf2fd93239d005/wait-for \
  > /usr/local/bin/wait-for && chmod +x /usr/local/bin/wait-for

RUN apt-get -q update && apt-get -qy install netcat

# Create a gradle cache directory as a volume that can be read/written by any
# container (including containers running as any user -- hence the a+rwx)
RUN mkdir /.gradle && chmod a+rwx -R /.gradle
VOLUME /.gradle
ENV GRADLE_USER_HOME /.gradle

# It never makes sense for Gradle to run a daemon within a docker container.
ENV GRADLE_OPTS="-Dorg.gradle.daemon=false"

RUN curl https://services.gradle.org/distributions/gradle-7.6.1-bin.zip -L > /tmp/gradle.zip
WORKDIR /tmp
RUN unzip gradle.zip && rm gradle.zip \
  && mv gradle-* /gradle
ENV PATH="$PATH:/gradle/bin"
WORKDIR /

COPY with-uid.sh /usr/local/bin