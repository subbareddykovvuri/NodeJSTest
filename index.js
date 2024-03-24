// server.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB connection string)
mongoose.connect('mongodb+srv://subbareddy934:SFZp2ZON3TU9EDXb@weatherapp.7wvka59.mongodb.net/?retryWrites=true&w=majority&appName=WeatherApp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define a Mongoose schema for color data
const colorSchema = new mongoose.Schema({
    color: String,
    count: Number,
});

const Color = mongoose.model('Color', colorSchema);

// Middleware to parse JSON bodies
//app.use(express.json());
app.use(express.static('views'));


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

        res.status(200).send('Color data saved successfully');
    } catch (error) {
        console.error('Error saving color data:', error);
        res.status(500).send('An error occurred while saving color data');
    }
});

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



/*const express =require('express')
const bodyParser=require('body-parser')
const request=require('request')

const app=express()

const apikey='';
app.unsubscribe(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.get('/',function(req,res){
    res.render('index',{weather:null,error:null})
}) 

app.post('/',function(req,res){
    let city=req.body.city
    let url='https://api.openweathermap.org/data/2.5/weather?q=${city}&appid={apikey}'
    console.log(req.body.city);
    request(url,function(err,response,body){
        if(err){
            res.render('index',{weather:null,error:'Error,Please try again'})

        }
        else{
            let weather=JSON.parse(body)
            if(weather.main==undefined){
                res.render('index',{
                    weather:null,
                    error:'Error, please try again',
                });
            }else{
                let weatherText='It ${weather.main.temp} degrees celsius with ${weather.weather[0].main} in ${weather.name}';
                res.render('index',{weather:weatherText,error:null});
                console.log('body:',body);
            }
        }
    })
})

app.listen(3000,function(){
    console.log("weatherly app listening on port 3000");
});*/
/*
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// MongoDB connection URI
//const mongoURI = 'mongodb://localhost:27017/mydatabase'; // Change this to your MongoDB URI
const mongoURI='mongodb+srv://subbareddy934:SFZp2ZON3TU9EDXb@weatherapp.7wvka59.mongodb.net/?retryWrites=true&w=majority&appName=WeatherApp';
// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check MongoDB connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a mongoose schema for your data
const dataSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    // Add more fields as needed
});

// Create a mongoose model based on the schema
const Data = mongoose.model('Data', dataSchema);

app.get('/', async (req, res) => {
    try {
        // Retrieve data from MongoDB
        const allData = await Data.find();
        res.json(allData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});
// Route to handle POST requests from ESP8266
app.post('/data', (req, res) => {
    // Extract data from the request body
    const { temperature, humidity } = req.body;

    // Create a new document using the Data model
    const newData = new Data({
        temperature,
        humidity,
        // Add more fields as needed
    });

    // Save the document to the database
    newData.save((err) => {
        if (err) {
            console.error('Error saving data:', err);
            res.status(500).send('Error saving data to database');
        } else {
            console.log('Data saved successfully');
            res.status(200).send('Data saved successfully');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
*/
