FROM ghcr.io/diploi/nextjs-postgresql-template

# Install application code
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build