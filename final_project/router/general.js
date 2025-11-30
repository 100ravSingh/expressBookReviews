const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper that returns books using a Promise
const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

// Helper that returns a single book by ISBN using a Promise
const getBookByIsbn = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
};

// Helper that returns books by author using a Promise
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    keys.forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found for this author");
    }
  });
};

// Helper that returns books by title using a Promise
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    keys.forEach(key => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found with this title");
    }
  });
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username & password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.filter((user) => user.username === username).length > 0;

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Register new user
  users.push({ username, password });

  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooks()
    .then((bookList) => {
      return res.send(JSON.stringify(bookList, null, 4));
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "Error retrieving books", error: err.toString() });
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  getBookByIsbn(isbn)
    .then((book) => {
      return res.send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  getBooksByAuthor(author)
    .then((booksByAuthor) => {
      return res.send(JSON.stringify(booksByAuthor, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  getBooksByTitle(title)
    .then((booksByTitle) => {
      return res.send(JSON.stringify(booksByTitle, null, 4));
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;      // Get ISBN from URL
  const book = books[isbn];          // Look up the book by ISBN

  if (book) {
    // Return only the reviews object
    return res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
