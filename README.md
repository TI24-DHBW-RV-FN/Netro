# Netro

## Expo Frontend

Prerequisites:

- Node.js (version 14 or higher)
- Expo CLI (install globally using `npm install -g expo-cli`)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/wes1101/netro
    ```
2. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

### Running the App

1. Start the Expo development server:
    ```bash
    npm start
    ```
2. Follow the instructions in the terminal to run the app on an emulator or physical device.

## Express Backend

Prerequisites:

- Node.js (version 14 or higher)

### Installation

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```

### Running the Server

1. Start the Express server:
    ```bash
    npm run dev
    ```
2. The server will run on `http://localhost:3000` by default.

Or compile and run JavaScript:

1. Compile the TypeScript code:
    ```bash
    npm run build
    ```
2. Start the compiled JavaScript server:
    ```bash
    npm start
    ```

## Postgres Database

Prerequisites:

- Docker

Use docker-compose to set up the Postgres database:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: netro_postgres
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  pgadmin:
    image: dpage/pgadmin4
    container_name: netro_pgadmin
    restart: unless-stopped
    env_file:
      - .env
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      - postgres

volumes:
  postgres_data:
  pgadmin_data:
```

1. Save the above configuration in a `docker-compose.yml` file in root.
2. Run the following command to start the database:
    ```bash
    docker-compose up -d
    ```
3. The Postgres database will be accessible at `localhost:5432` with the specified credentials.
4. Use the databse url `postgresql://example_user:example_password@localhost:5432/example_db` to connect to the database from your backend application.
