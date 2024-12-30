const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am MovieBot!');
});

app.post('/webook', function (req, res) {
    console.log(JSON.stringify(req.body)); // Log the incoming request body to inspect the structure
    const genre = req.body.queryResult.parameters.genre;  // Extract the genre from parameters

    const genreMovies = {
        action: "Here are some Action movies: Matrix, Gladiator, John Wick.",
        drama: "Here are some Drama movies: The Shawshank Redemption, Fight Club.",
        sci_fi: "Here are some Sci-Fi movies: Interstellar, The Martian, Blade Runner 2049.",
        horror: "Here are some Horror movies: The Conjuring, IT, A Nightmare on Elm Street."
    };

    // Get movie recommendations based on genre, or fallback to a default message
    const responseText = genreMovies[genre] || `Sorry, I don't have recommendations for ${genre} movies.`;

    // Respond back with the recommendation
    const out = {
        fulfillmentText: responseText,  // Dialogflow expects "fulfillmentText" for text responses
        fulfillmentMessages: [
            {
                text: { text: [responseText] }
            }
        ]
    };

    const outString = JSON.stringify(out); // Prepare the response as a JSON string
    console.log('Out:', outString); // Log the output for debugging
    res.send(outString); // Send the response back to Dialogflow
});

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'));
});
