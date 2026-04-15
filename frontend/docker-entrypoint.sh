#!/bin/sh
# Resolve the API upstream URL from the Aspire-injected env var and write
# the final nginx config. We do this ourselves rather than relying on the
# nginx template mechanism because scripts in /docker-entrypoint.d/ run in
# subshells, so 'export' cannot set variables for later entrypoint steps.
export API_URL="${services__api__http__0:-http://localhost:5000}"
envsubst '$API_URL' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf
