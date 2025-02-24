# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

## Added routes and Models:
- Job:
 - get, 
## Updated and added comments: 
- routes: Jobs, Companies
- models: Jobs, Companies
- middleware helper functions: sqlForPartialUpdate
- auth middleware functions:  ensureLoggedIn, isAdmin, isUserOrAdmin