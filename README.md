# Portfolio Generator

A full-stack web application that allows users to create, customize, preview, and share their own personal portfolios using ready-made templates.

## Live Demo

[Portfolio Generator](https://portfolio-maker-inky.vercel.app/)

## GitHub Repository

[View Source Code](https://github.com/jsumaiyarpa/portfolio_lab02)

## About the Project

Portfolio Generator is a web-based portfolio creation platform designed to make building a personal portfolio simple and accessible.

Users can create an account, enter their personal and professional information, choose a portfolio template, preview their portfolio, and share it through a public link.

The project was developed as a full-stack web application to practice frontend development, backend development, database integration, authentication, REST APIs, and deployment.

## Features

* User registration and login
* Secure password hashing
* JWT-based authentication
* Create and edit portfolio information
* Personal profile management
* Portfolio preview
* Multiple portfolio templates
* Template selection and customization
* Public portfolio sharing through a unique link
* Responsive web interface
* Portfolio data stored in MongoDB
* Protected user-specific portfolio data
* Delete portfolio functionality
* Deployed frontend and backend

## Available Templates

The application currently includes four portfolio templates:

* Corporate
* Dark
* Glass
* Minimal

Each template provides a different visual style while using the same portfolio information.

## User Flow

```text
Sign Up
   ↓
Login
   ↓
Dashboard
   ↓
Create Portfolio
   ↓
Enter Information
   ↓
Choose Template
   ↓
Preview Portfolio
   ↓
View as Template
   ↓
Share Public Portfolio
```

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JSON Web Token (JWT)
* bcrypt

### Development & Deployment

* Visual Studio Code
* Git
* GitHub
* MongoDB Atlas
* Render
* Vercel

## Project Structure

```text
portfolio_lab02/
│
├── client/
│   ├── assets/
│   ├── css/
│   ├── html/
│   ├── js/
│   └── templates/
│       ├── corporate.html
│       ├── dark.html
│       ├── glass.html
│       └── minimal.html
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── app.js
│   ├── package.json
│   └── ...
│
└── README.md
```

## How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/jsumaiyarpa/portfolio_lab02.git
```

### 2. Open the project

```bash
cd portfolio_lab02
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder and add the required environment variables.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Do not upload your `.env` file or expose your database credentials and secret keys publicly.

### 5. Start the backend

```bash
npm start
```

The backend will run locally on:

```text
http://localhost:5000
```

### 6. Run the frontend

Open the frontend files through a local development server such as VS Code Live Server.

The frontend communicates with the backend API running on port `5000`.

## API Overview

The backend provides REST API endpoints for:

* User authentication
* Portfolio creation
* Portfolio retrieval
* Portfolio updating
* Portfolio deletion
* Public portfolio access

Authenticated requests use JWT-based authorization.

## Public Portfolio Sharing

Each portfolio can be accessed through a public URL.

A shared portfolio uses a public portfolio ID, allowing visitors to view the portfolio without accessing the owner's dashboard or private account information.

Example:

```text
/templates/minimal.html?id=PUBLIC_ID
```

## Deployment

The project is deployed using:

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

## What I Learned

Through this project, I practiced:

* Building a multi-page frontend using HTML, CSS, and JavaScript
* Connecting a frontend application to a backend REST API
* Working with Express.js and Node.js
* Designing and using MongoDB databases
* Implementing user authentication with JWT
* Password hashing with bcrypt
* Creating protected API routes
* Handling CRUD operations
* Creating public and authenticated portfolio views
* Connecting frontend and backend during deployment
* Using Git and GitHub for version control
* Deploying a full-stack application using Vercel and Render

## Future Improvements

Possible future improvements include:

* More portfolio templates
* Drag-and-drop customization
* Custom color and typography options
* PDF portfolio export
* Improved mobile responsiveness
* Portfolio analytics
* Custom portfolio domains
* Additional profile and social media integrations

## Author

**Sumaiya Jannat Arpa**

Computer Science & Engineering Student | 
East West University

* [LinkedIn](https://www.linkedin.com/in/sumaiya-jannat-arpa/)
* [Behance](https://www.behance.net/sumaiyaarpa2)

---

If you find this project interesting, feel free to explore the repository and live demo.
