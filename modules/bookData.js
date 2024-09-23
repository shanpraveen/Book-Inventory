const Sequelize = require('sequelize');

// Set up sequelize to point to your Postgres database
var sequelize = new Sequelize('neondb', 'neondb_owner', 'VdhoqRMt2GW6', {
    dialectModule: require('pg'),
    host: 'ep-lively-sky-a5w6dzz0.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }, 
    query: { raw: true }
});

// Define Book model
var Book = sequelize.define('Book', {
    bookId: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    genre: Sequelize.STRING,
    publicationYear: Sequelize.INTEGER,
    availableCopies: Sequelize.INTEGER
});

// Define Author model
var Author = sequelize.define('Author', {
    authorId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING
});

// In bookData.js
const genres = [
    { genreId: 1, genreName: "Fiction" },
    { genreId: 2, genreName: "Non-Fiction" },
    { genreId: 3, genreName: "Science Fiction" },
    { genreId: 4, genreName: "Fantasy" }
];

function getGenres() {
    return new Promise((resolve, reject) => {
        if (genres.length > 0) {
            resolve(genres);
        } else {
            reject("No genres found");
        }
    });
}

// Relationship between Book and Author
Author.hasMany(Book, { foreignKey: 'authorId' });

// Initialize the database
const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("Unable to sync the database:", err));
    });
};

// Get all books
const getAllBooks = () => {
    return new Promise((resolve, reject) => {
        Book.findAll()
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

// Get books by author
const getBooksByAuthor = (authorId) => {
    return new Promise((resolve, reject) => {
        Book.findAll({ where: { authorId: authorId } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

// Get book by book ID
const getBookById = (id) => {
    return new Promise((resolve, reject) => {
        Book.findOne({ where: { bookId: id } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

// Get all authors
const getAuthors = () => {
    return new Promise((resolve, reject) => {
        Author.findAll()
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

// Get author by ID
const getAuthorById = (id) => {
    return new Promise((resolve, reject) => {
        Author.findAll({ where: { authorId: id } })
            .then(data => resolve(data))
            .catch(err => reject("No results returned"));
    });
};

// Add a new book
function addBook(bookData) {
    return new Promise((resolve, reject) => {
        // Iterate over the bookData object and set empty strings to null
        for (let property in bookData) {
            if (bookData[property] === "") {
                bookData[property] = null;
            }
        }

        // Create a new book in the database
        Book.create(bookData)
            .then(() => resolve())
            .catch(err => reject("Unable to create book: " + err));
    });
}

// Update a book
const updateBook = (bookData) => {
    for (let property in bookData) {
        if (bookData[property] === "") {
            bookData[property] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Book.update(bookData, { where: { bookId: bookData.bookId } })
            .then(() => resolve())
            .catch(err => reject("Unable to update book"));
    });
};

// Delete a book
const deleteBook = (id) => {
    return new Promise((resolve, reject) => {
        Book.destroy({ where: { bookId: id } })
            .then(() => resolve())
            .catch(err => reject("Unable to delete book"));
    });
};

// Add a new author
function addAuthor(authorData) {
    return new Promise((resolve, reject) => {
        // Iterate over the authorData object and set empty strings to null
        for (let property in authorData) {
            if (authorData[property] === "") {
                authorData[property] = null;
            }
        }

        // Create a new author in the database
        Author.create(authorData)
            .then(() => resolve())
            .catch(err => reject("Unable to create author: " + err));
    });
}

// Update an author
const updateAuthor = (authorData) => {
    for (let property in authorData) {
        if (authorData[property] === "") {
            authorData[property] = null;
        }
    }

    return new Promise((resolve, reject) => {
        Author.update(authorData, { where: { authorId: authorData.authorId } })
            .then(() => resolve())
            .catch(err => reject("Unable to update author"));
    });
};

// Delete an author
const deleteAuthor = (id) => {
    return new Promise((resolve, reject) => {
        Author.destroy({ where: { authorId: id } })
            .then(() => resolve())
            .catch(err => reject("Unable to delete author"));
    });
};

// Export the functions
module.exports = {
    initialize,
    getAllBooks,
    getAuthors,
    getAuthorById,
    getBooksByAuthor,
    getBookById,
    addBook,
    updateBook,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    deleteBook,
    getGenres
};
