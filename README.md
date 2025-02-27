# Challenge Backend

## Description

This project is an Express application that connects to a MongoDB database. It provides functionality for uploading files and managing tasks, utilizing various middleware for error handling and permission checks.

## Messaging

This application utilizes messaging queues with RabbitMQ to handle asynchronous task processing. RabbitMQ allows for efficient communication between different parts of the application, ensuring that tasks are processed reliably and in a timely manner.

## Features

- File upload capabilities
- Task management
- Asynchronous processing with RabbitMQ

## API Documentation

### Endpoints

- **POST /upload**

  - Uploads a file.
  - **Request Body:** Form-data containing the file.
  - **Response:** JSON object with task ID and file path.

- **GET /status/:taskId**

  - Retrieves the status of a specific task by its ID.
  - **Response:** JSON object with taskId, status, and hasErrors.

- **GET /data/:taskId**

  - Retrieves data associated with a specific task by its ID, with optional pagination (page and limit).
  - **Response:** JSON object with task data.

- **GET /errors/:taskId**
  - Retrieves errors associated with a specific task by its ID, with optional pagination (page and limit).
  - **Response:** JSON object with task errors.

## Acknowledgments

- [Express](https://expressjs.com/) for the web framework.
- [MongoDB](https://www.mongodb.com/) for the database.
- [RabbitMQ](https://www.rabbitmq.com/) for messaging.

## Installation

To set up the project, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd challenge-backend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Usage

To run the application, use the following command:

```bash
docker compose up
```

The server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## Testing

To run the test suite, use the following command:

```bash
yarn test
```

For continuous testing, you can use:

```bash
yarn test:watch
```

To check test coverage, run:

```bash
yarn test:coverage
```
