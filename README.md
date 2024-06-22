# Role-Based Access Control API

This is a Node.js API project demonstrating role-based access control using MongoDB. The application has three roles: Admin, Recruiter, and Client. Each role has different permissions and capabilities.

## Features

- **Admin**:

  - Login and manage profile
  - Create Recruiter accounts
  - CRUD operations on Recruiter accounts
  - CRUD operations on Client accounts

- **Recruiter**:

  - Login and manage profile
  - View job requirement posts assigned to them
  - Add notes to job requirement posts

- **Client**:
  - Register and login
  - Create job requirement posts
  - View all posts and notes added by Recruiters

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Installation

1. Clone the repository:

   git clone [<repository-url>](https://github.com/hardik-kanani/role-base-api.git)
   cd role-based-api

2. Install the dependencies:

   npm install

3. Create a .env file in the root directory and add the following variables:

   PORT="3000"
   DATABASE_URL='mongodb://127.0.0.1:27017/role-base-api'
   HOST='localhost'
   JWT_SECRET="your_jwt_secret"
   JWT_EXPIRES_IN="1h"
   SENDGRID_HOST=''
   SENDGRID_PORT=''
   SENDER_EMAIL=''
   SENDGRID_SECRET_KEY=''

4. Start the server:

   npm run start
   or
   nodemon
