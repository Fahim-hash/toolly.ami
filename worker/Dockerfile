FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
  && apt-get install -y --no-install-recommends imagemagick ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY policy.xml /tmp/toolly-policy.xml
RUN set -eux; target="$(find /etc -path '*/ImageMagick-*/policy.xml' -print -quit)"; test -n "$target"; cp /tmp/toolly-policy.xml "$target"

COPY server.mjs .

ENV PORT=8080
ENV MAX_UPLOAD_BYTES=8589934592
EXPOSE 8080

CMD ["node", "server.mjs"]
