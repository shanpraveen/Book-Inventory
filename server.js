var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const exphbs = require('express-handlebars');
const path = require('path');
var app = express();

// Handlebars setup
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), 'public')));

const bookData = require('./modules/bookData');

// Middleware for active route
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    res.render('about');
});

// Route for adding a book
app.get('/books/add', (req, res) => {
    bookData.getGenres()
        .then(genres => {
            res.render('addBook', { genres: genres });
        })
        .catch(err => {
            console.error(err);
            res.render('addBook', { genres: [] });
        });
});

app.post('/books/add', (req, res) => {
    let dataReq = {
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        publishedDate: req.body.publishedDate,
        genre: req.body.genre || null
    };

    bookData.addBook(dataReq)
        .then(() => {
            res.redirect('/books');
        })
        .catch(err => {
            console.error(err);
            res.redirect('/books');
        });
});

// Get all books
app.get("/books", function (req, res) {
    if (req.query.genre) {
        bookData.getBooksByGenre(req.query.genre)
            .then(data => {
                if (data.length > 0) {
                    res.render("books", { books: data });
                } else {
                    res.render("books", { message: "No books found" });
                }
            })
            .catch(err => {
                res.render("books", { message: "No results found" });
            });
    } else {
        bookData.getAllBooks()
            .then(data => {
                if (data.length > 0) {
                    res.render("books", { books: data });
                } else {
                    res.render("books", { message: "No books available" });
                }
            })
            .catch(err => {
                res.render("books", { message: "No results found" });
            });
    }
});

// Get book by ID
app.get("/books/:id", (req, res) => {
    let viewData = {};
    bookData.getBookById(req.params.id)
        .then(data => {
            if (data) {
                viewData.book = data;
            } else {
                viewData.book = null;
            }
        })
        .catch(() => {
            viewData.book = null;
        })
        .then(bookData.getGenres)
        .then(data => {
            viewData.genres = data;
            for (let i = 0; i < viewData.genres.length; i++) {
                if (viewData.genres[i].genreId == viewData.book.genre) {
                    viewData.genres[i].selected = true;
                }
            }
        })
        .catch(() => {
            viewData.genres = [];
        })
        .then(() => {
            if (viewData.book == null) {
                res.status(404).send("Book Not Found");
            } else {
                res.render("book", { viewData: viewData });
            }
        });
});

// Update book details
app.post('/book/update', (req, res) => {
    let updatedBook = {
        bookId: parseInt(req.body.bookId, 10),
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        publishedDate: req.body.publishedDate,
        genre: req.body.genre
    };

    bookData.updateBook(updatedBook)
        .then(() => {
            res.redirect('/books');
        })
        .catch(err => {
            console.error(err);
            res.redirect('/books');
        });
});

// Delete a book
app.get('/book/delete/:id', (req, res) => {
    bookData.deleteBook(req.params.id)
        .then(() => {
            res.redirect('/books');
        })
        .catch(err => {
            res.status(500).send("Unable to delete book");
        });
});


// Initialize the app and database connection
bookData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => { console.log("Server listening on port " + HTTP_PORT) });
    })
    .catch((err) => {
        console.error(err);
    });

module.exports = app;
