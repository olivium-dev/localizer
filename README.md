# Localizer

A full-stack application for managing localization keys and translations, similar to PO Editor.

## Features

- Create, read, update, and delete localization keys
- Manage multiple languages, with one set as default
- Store translations for each key in different languages
- Default language translation is required for each key
- Responsive UI built with React and Material UI

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL with Sequelize ORM
- **Frontend**: React with Material UI components

## Project Structure

```
localizer/
├── backend/            # Node.js Express backend
│   ├── config/         # Configuration files
│   ├── controllers/    # API controllers
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routes
│   └── server.js       # Main server file
└── frontend/           # React frontend
    ├── public/         # Static assets
    └── src/            # React source code
        ├── api/        # API services
        └── components/ # React components
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
   ```
   PORT=5000
   DB_NAME=localizer
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. Create a PostgreSQL database named `localizer`:
   ```
   createdb localizer
   ```

5. Start the backend server:
   ```
   npm run dev
   ```
   This will start the server on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```
   This will start the client on http://localhost:3000

## API Endpoints

### Languages
- `GET /api/languages` - Get all languages
- `GET /api/languages/:id` - Get a specific language
- `POST /api/languages` - Create a new language
- `PUT /api/languages/:id` - Update a language
- `DELETE /api/languages/:id` - Delete a language

### Localization Keys
- `GET /api/keys` - Get all keys with their string values
- `GET /api/keys/:id` - Get a specific key with its string values
- `POST /api/keys` - Create a new key with string values
- `PUT /api/keys/:id` - Update a key and its string values
- `DELETE /api/keys/:id` - Delete a key and all its string values

## License

MIT 