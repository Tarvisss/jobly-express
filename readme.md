# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

## Added routes and Models:
Routes for adding, patching, and removing a job were added. 
The response from a get request to companies/:handle will now show a job object with an array of the jobs that are associated with that company's handle.
A post route that allows a user to apply to a job was added into the user model.

## Updated and added comments: 
- middleware helper functions: sqlForPartialUpdate
- auth middleware functions:  ensureLoggedIn, isAdmin, isUserOrAdmin
- User model:(functions) applyToJob