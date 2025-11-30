const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const existingUsers = users.filter(user => user.username === username);
  return existingUsers.length === 0;
};

const authenticatedUser = (username, password) => {
  const validUsers = users.filter(
    user => user.username === username && user.password === password
  );
  return validUsers.length > 0;
};


//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username & password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate credentials
  if (authenticatedUser(username, password)) {
    // Create JWT token
    let accessToken = jwt.sign(
      { data: username },   // payload
      "access",             // secret key (must match index.js middleware)
      { expiresIn: "1h" }   // token expiry
    );

    // Save in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  // Username stored in the session during login
  const username = req.session.authorization && req.session.authorization.username;

  // Basic validations
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure reviews object exists
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

// Delete a book review (only by the same logged-in user)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Username stored in session during login
  const username = req.session.authorization && req.session.authorization.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const book = books[isbn];

  // If no reviews present or no review from this user
  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on this book" });
  }

  // Delete only this user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: book.reviews
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
