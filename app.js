const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Republic_C207',
    database: 'customerdb'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL Database.');
    }
});

// Home route
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM customers';
    connection.query(sql, (error, results) => {
        if (error) throw error;
        res.render('index', { customers: results });
    });
});

// Search route
app.get('/search', (req, res) => {
    const searchTerm = req.query.query;

    if (!searchTerm || searchTerm.trim() === "") {
        return res.redirect("/");
    }

    const sql = `
        SELECT * FROM customers
        WHERE customerName LIKE ?
           OR contactNumber LIKE ?
           OR email LIKE ?
           OR address LIKE ?`;

    const likeSearch = `%${searchTerm}%`;

    connection.query(sql, [likeSearch, likeSearch, likeSearch, likeSearch], (error, results) => {
        if (error) {
            console.error('Error searching customers:', error);
            res.status(500).send('Database error');
        } else {
            res.render('index', { customers: results });
        }
    });
});

// Add customer form
app.get('/addCustomer', (req, res) => {
    res.render('addCustomer');
});

// Handle adding customer
app.post('/addCustomer', (req, res) => {
    const { name, contactNumber, email, address } = req.body;

    const sql = 'INSERT INTO customers (customerName, contactNumber, email, address) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, contactNumber, email, address], (error, results) => {
        if (error) {
            console.error('Error adding customer:', error);
            res.status(500).send('Error adding customer');
        } else {
            console.log('Customer added successfully!');
            res.redirect('/');
        }
    });
});

// Edit customer
app.get('/editCustomer/:id', (req, res) => {
    const customerId = req.params.id;
    const sql = 'SELECT * FROM customers WHERE customerId = ?';
    connection.query(sql, [customerId], (error, results) => {
        if (error) throw error;
        res.render('editCustomer', { customer: results[0] });
    });
});

// Handle edit
app.post('/editCustomer/:id', (req, res) => {
    const customerId = req.params.id;
    const { name, contactNumber, email, address } = req.body;

    const sql = 'UPDATE customers SET customerName = ?, contactNumber = ?, email = ?, address = ? WHERE customerId = ?';
    connection.query(sql, [name, contactNumber, email, address, customerId], (error, results) => {
        if (error) {
            console.error('Error updating customer:', error);
            res.status(500).send('Error updating customer');
        } else {
            console.log('Customer updated successfully!');
            res.redirect('/');
        }
    });
});

// Delete customer
app.get('/deleteCustomer/:id', (req, res) => {
    const customerId = req.params.id;
    const sql = 'DELETE FROM customers WHERE customerId = ?';
    connection.query(sql, [customerId], (error, results) => {
        if (error) {
            console.error('Error deleting customer:', error);
            res.status(500).send('Error deleting customer');
        } else {
            console.log('Customer deleted successfully!');
            res.redirect('/');
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});