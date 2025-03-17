const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'items.csv');

app.use(express.json());
app.use(cors());

// Function to read items from CSV
const readItems = () => {
    return new Promise((resolve, reject) => {
        const items = [];
        fs.createReadStream(FILE_PATH)
            .pipe(csv())
            .on('data', (row) => items.push(row))
            .on('end', () => resolve(items))
            .on('error', (error) => reject(error));
    });
};

// Function to write items to CSV
const writeItems = (items) => {
    const csvFields = ['id', 'date', 'brand', 'item', 'price'];
    const csvData = parse(items, { fields: csvFields });

    fs.writeFileSync(FILE_PATH, csvData);
};

// Ensure CSV file exists
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, 'id,date,brand,item,price\n');
}

// Get all items
app.get('/items', async (req, res) => {
    try {
        const items = await readItems();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error reading items' });
    }
});

// Add a new item
app.post('/items', async (req, res) => {
    try {
        const { date, brand, item, price } = req.body;
        const items = await readItems();
        const newItem = {
            id: Date.now().toString(),
            date,
            brand,
            item,
            price
        };

        items.push(newItem);
        writeItems(items);

        res.json({ message: 'Item added', item: newItem });
    } catch (error) {
        res.status(500).json({ error: 'Error adding item' });
    }
});

// Update an item
app.put('/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, brand, item, price } = req.body;
        let items = await readItems();
        const index = items.findIndex((i) => i.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        items[index] = { id, date, brand, item, price };
        writeItems(items);

        res.json({ message: 'Item updated', item: items[index] });
    } catch (error) {
        res.status(500).json({ error: 'Error updating item' });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
