const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const csvParser = require('csv-parser');

const app = express();
const PORT = 3000;
const FILE_PATH = 'items.csv';

app.use(cors());
app.use(bodyParser.json());

// Ensure CSV file exists
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, 'date,brand,item,price,user,category,payment\n');
}

// Endpoint to get items
app.get('/items', (req, res) => {
    const results = [];
    fs.createReadStream(FILE_PATH)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => res.json(results));
});

// Endpoint to add an item
app.post('/items', (req, res) => {
    const { date, brand, item, price, user, category, payment } = req.body;
    const newItem = `${date},${brand},${item},${price},${user},${category},${payment}\n`;

    fs.appendFile(FILE_PATH, newItem, (err) => {
        if (err) {
            res.status(500).json({ message: 'Error saving data' });
        } else {
            res.json({ message: 'Item added successfully' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
