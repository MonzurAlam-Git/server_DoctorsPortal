# SmileCraft Dentistry - Doctors Portal Server

Welcome to SmileCraft Dentistry's Doctors Portal Server! This server is designed to handle backend functionalities for the Doctors Portal project, including managing appointments, patient data, and user authentication.

## Main Features

- **Appointment Management**: Provides endpoints for creating, updating, and retrieving appointments.
- **Patient Data Handling**: Offers APIs for managing patient information, including contact details and medical history.
- **User Authentication**: Implements authentication endpoints for user registration, login, and access control.

## Live Site

Access the live Doctors Portal at [Live Link](https://doctorsportal-11797.web.app/).

## Live Server : 
[Live Server Link](https://server-doctors-portal.vercel.app)

## API End Points 

### Get All Services
Endpoint: GET /services
Description: Retrieves a list of all services.
User Login/Signup

### Endpoint: PUT /user/:email
Description: Creates or updates a user and generates a JWT token.
Parameters:
:email (URL parameter) - User email
Request body should contain user data
Check Available Services

### Endpoint: GET /available
Description: Retrieves available services based on the provided date.
Query Parameter: date - The date for which available services are checked.
Protected Endpoints (Require JWT)
Get All Users

### Endpoint: GET /users
Description: Retrieves a list of all users.
Middleware: verifyJWT
Check if User is Admin

### Endpoint: GET /admin/:email
Description: Checks if a user is an admin.
Parameters:
:email (URL parameter) - User email
Make a User Admin

### Endpoint: PUT /users/admin/:email
Description: Grants admin role to a user.
Parameters:
:email (URL parameter) - User email
Middleware: verifyJWT
Get User Bookings

### Endpoint: GET /bookings
Description: Retrieves bookings of the authenticated user based on email.
Query Parameter: email - User email
Middleware: verifyJWT
Create a Booking

### Endpoint: POST /bookings
Description: Creates a new booking if it does not already exist.
Request Body: Booking data
Root Endpoint
Root
### Endpoint: GET /
Description: Displays a simple HTML message.
Middleware
verifyJWT: This middleware is used to verify JWT tokens and protect specific endpoints. It reads the token from the Authorization header, verifies it, and if valid, allows access to the protected route.
      

## Packages Used
The server utilizes the following packages along with their version numbers:

Express: 4.17.1
JWT: 8.5.1
dotenv: 10.0.0
