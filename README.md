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
version: "3.8"

services:
    db:
        image: postgres:15
        restart: always
        environment:
            POSTGRES_USER: example_user
            POSTGRES_PASSWORD: example_password
            POSTGRES_DB: example_db
        ports:
            - "5432:5432"
        volumes:
            - pgdata:/var/lib/postgresql/data

volumes:
    pgdata:
```

1. Save the above configuration in a `docker-compose.yml` file in root.
2. Run the following command to start the database:
    ```bash
    docker-compose up -d
    ```
3. The Postgres database will be accessible at `localhost:5432` with the specified credentials.
4. Use the databse url `postgresql://example_user:example_password@localhost:5432/example_db` to connect to the database from your backend application.
