FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends imagemagick ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY policy.xml /etc/ImageMagick-7/policy.xml
COPY server.mjs .

ENV PORT=8080
ENV MAX_UPLOAD_BYTES=8589934592
EXPOSE 8080

CMD ["node", "server.mjs"]
