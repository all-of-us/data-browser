# Image used for deployment. The Circle image is not used here as it does not
# have an ARM build (M1 chip requires emulation).
# Keep synchronized with ci/Dockerfile.circle_build
#
# Pinned to noble (Ubuntu 24.04). Two constraints drive this:
#   - jira-ruby 3.2.0 requires Ruby >= 3.1; noble's default `ruby` is 3.2,
#     whereas jammy shipped 3.0.2 (gem install failed the version gate).
#   - gsutil requires Python 3.8-3.12; noble ships 3.12.
# Do NOT float this tag: the bare `17` / `17-jdk` tag now resolves to Ubuntu
# 26.04 (resolute) which ships Python 3.14, breaking gsutil.
FROM eclipse-temurin:17-jdk-noble

# Upgrade base OS packages to pick up available security fixes (binutils, etc.)
# from the Ubuntu archive. Must run before any other apt-get install so the
# downstream layers inherit the patched baseline.
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get -yq upgrade \
  && apt-get install --no-install-recommends -yq \
  gettext \
  ruby \
  default-mysql-client \
  python3 \
  python3-pip \
  nodejs \
  npm \
  git \
  curl \
  unzip \
  wait-for-it \
  sudo \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global yarn n
# Upgrade to Node 22 LTS (required by Angular 19).
RUN n 22

# Install openapi-generator-cli
RUN npm install @openapitools/openapi-generator-cli -g

ENV CLOUD_SDK_VERSION 503.0.0

WORKDIR /root
RUN curl -o gcloud.tgz https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
  tar -xf gcloud.tgz && \
  ./google-cloud-sdk/install.sh --quiet && \
  ./google-cloud-sdk/bin/gcloud components install app-engine-java && \
  rm -rf /root/google-cloud-sdk/platform/bundledpythonunix && \
  rm -rf gcloud.tgz

# Force gcloud/gsutil to use system python3 (Ubuntu 24.04 ships 3.12).
ENV CLOUDSDK_PYTHON=/usr/bin/python3

ENV PATH=/root/google-cloud-sdk/bin:$PATH

RUN curl -o /tmp/cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.linux.amd64 \
  && mv /tmp/cloud_sql_proxy /usr/local/bin && chmod +x /usr/local/bin/cloud_sql_proxy

# It never makes sense for Gradle to run a daemon within a docker container.
ENV GRADLE_OPTS="-Dorg.gradle.daemon=false"

ENV GRADLE_VERSION 7.6.1

RUN curl -L -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip \
  && unzip /tmp/gradle.zip -d /opt/gradle

ENV PATH="/opt/gradle/gradle-${GRADLE_VERSION}/bin:${PATH}"

RUN gem install logger
RUN gem install concurrent-ruby -v 1.3.4
RUN gem install activesupport -v 6.1.4.6 --conservative
RUN gem install jira-ruby -v '3.2.0'