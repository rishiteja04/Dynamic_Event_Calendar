# Event Calendar Application

A dynamic, interactive event calendar application built with React and Express.

## Features

- Monthly view calendar with event management
- Add, edit, and delete events
- Support for recurring events
- Drag-and-drop functionality for rescheduling
- Event conflict detection
- Filtering and searching capabilities
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-calendar
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Start MongoDB:
Make sure MongoDB is running on your local machine at `mongodb://localhost:27017`

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```
The server will run on http://localhost:3001

2. In a new terminal, start the frontend development server:
```bash
npm start
```
The application will open in your browser at http://localhost:3000

## API Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an existing event
- `DELETE /api/events/:id` - Delete an event

## Technologies Used

- Frontend:
  - React
  - FullCalendar
  - Axios
  - date-fns

- Backend:
  - Express.js
  - MongoDB
  - Mongoose

## License

MIT 