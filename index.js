
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const { createServer } = require('http');
var router=express.Router();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB connection string)
const mongoURI='mongodb+srv://subbareddy934:SFZp2ZON3TU9EDXb@weatherapp.7wvka59.mongodb.net/?retryWrites=true&w=majority&appName=WeatherApp';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a Mongoose schema for color data
const colorSchema = new mongoose.Schema({
    color: String,
    count: Number,
});

const Color = mongoose.model('Color', colorSchema);

// Middleware to parse JSON bodies
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('views'));

// WebSocket server
//const wss = new WebSocket.Server({ port:8080});


const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast color data updates to all connected clients
function broadcastColorDataUpdate(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}


// Route to handle incoming color data
app.post('/api/colors', async (req, res) => {
    try {
        const { color } = req.body;
        console.log(color);
        // Find existing color in database
        let existingColor = await Color.findOne({ color });

        if (!existingColor) {
            // If color doesn't exist, create a new entry
            existingColor = new Color({ color, count: 1 });
        } else {
            // If color exists, increment the count
            existingColor.count++;
        }

        // Save or update the color data
        await existingColor.save();
        // Fetch all colors from the database
        const allColors = await Color.find();
        const colors = allColors.map(item => item.color);
        const counts = allColors.map(item => item.count);

        // Broadcast color data updates to all connected clients
        broadcastColorDataUpdate({ colors, counts });

        res.status(200).send('Color data saved successfully');
    } catch (error) {
        console.error('Error saving color data:', error);
        res.status(500).send('An error occurred while saving color data');
    }
});

app.delete('/api/colors',async(req,res)=>{
    try {
        console.log("Deleting data");
        // Update count of all colors to zero
        await Color.updateMany({}, { $set: { count: 0 } });
        console.log("Deleted data successfully");
        // Broadcast color data updates to all connected clients
        broadcastColorDataUpdate({ colors: [], counts: [] });

        res.status(200).send('Color data cleared successfully');
    } catch (error) {
        console.error('Error clearing color data:', error);
        res.status(500).send('An error occurred while clearing color data');
    }
})

// Route to fetch color data
app.get('/api/colors', async (req, res) => {
    try {
        const colors = await Color.find();
        res.json(colors);
    } catch (error) {
        console.error('Error fetching color data:', error);
        res.status(500).send('An error occurred while fetching color data');
    }
});

// WebSocket server event listeners
wss.on('connection', function connection(ws) {
    console.log('Client connected');
    
    // Send initial color data when a client connects
    Color.find({}, function(err, colors) {
        if (err) {
            console.error('Error fetching color data:', err);
            return;
        }

        const colorData = {
            colors: colors.map(item => item.color),
            counts: colors.map(item => item.count),
        };
        
        ws.send(JSON.stringify(colorData));
    });

    ws.on('close', function close() {
        console.log('Client disconnected');
    });
});

//Start the Server
server.listen(8080, function () {
    console.log('Listening on http://0.0.0.0:8080');
  });
