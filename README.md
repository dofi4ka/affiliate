`docker-compose.yml`
```
version: "3.9"

services:
  frontend:
    image: ghcr.io/dofi4ka/affiliate:latest
    ports:
      - "80:3000"
```