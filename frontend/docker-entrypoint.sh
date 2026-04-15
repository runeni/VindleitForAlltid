#!/bin/sh
# Map the Aspire service-discovery env var to the name used in nginx.conf template.
# Aspire injects: services__api__http__0=http://<host>:<port>
# nginx template expects: API_URL
export API_URL="${services__api__http__0:-http://localhost:5000}"
