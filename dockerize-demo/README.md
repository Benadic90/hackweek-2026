# Dockerizee Challenge (200 Points)

A highly optimized, production-ready containerized Express web application using Docker and Docker Compose. 

## Key Features Implemented:
- **Lightweight Base Image**: Uses `node:18-alpine` to drastically reduce the container footprint.
- **Dependency Optimization**: Leverages Docker layer caching by copying `package.json` first, and uses `npm ci --only=production`.
- **Environment Variables**: Dynamically reads from a `.env` file using the `env_file` directive.
- **Security**: Runs the container process under the non-root `node` user.
- **Size Optimization**: Includes a strict `.dockerignore` to prevent `node_modules`, local `.env` secrets, and git histories from bloating the image.
- **Orchestration**: Includes a `docker-compose.yml` for effortless one-click deployments.

---

## 🚀 How to Build and Run

### Option 1: Using Docker Compose (Recommended)
This is the easiest way to run the app as it automatically handles the environment variables and port mapping.

1. Ensure Docker is installed and running.
2. Clone this repository and navigate to this folder.
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Run the compose up command:
   ```bash
   docker-compose up -d --build
   ```
5. Open your browser and go to `http://localhost:3000`.

### Option 2: Using standard Docker commands

1. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Build the Docker image:
   ```bash
   docker build -t dockerize-demo .
   ```
3. Run the Docker container, passing in the `.env` file and exposing port 3000:
   ```bash
   docker run -d -p 3000:3000 --env-file .env --name my-docker-app dockerize-demo
   ```
4. Open your browser and go to `http://localhost:3000`.

### Environment Variables
The application looks for the following environment variables (defined in `.env`):
- `PORT` (default: 3000): The port the Express app listens on.
- `APP_NAME`: The title displayed on the web page.
- `NODE_ENV`: Sets the environment mode (e.g., development, production).
