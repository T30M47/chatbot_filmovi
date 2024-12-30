const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Webhook Server is Running!');
});

// Webhook Endpoint
app.post('/webhook', (req, res) => {
    console.log('Request Body:', JSON.stringify(req.body)); // Log the full request body

    // Access genre from queryResult.parameters
    const genre = req.body.queryResult?.parameters?.genre; // Adjusted to queryResult.parameters

    if (!genre) {
        console.log('No genre found in request parameters.');
        return res.json({
            fulfillmentMessages: [
                {
                    text: { text: ["Sorry, I didn't receive a genre."] }
                }
            ]
        });
    }

    const genreMovies = {
        action: "Here are some Action movies: Matrix, Gladiator, John Wick.",
        drama: "Here are some Drama movies: The Shawshank Redemption, Fight Club.",
        sci_fi: "Here are some Sci-Fi movies: Interstellar, The Martian, Blade Runner 2049.",
        horror: "Here are some Horror movies: The Conjuring, IT, A Nightmare on Elm Street."
    };

    const responseText = genreMovies[genre.toLowerCase()] || `Sorry, I don't have recommendations for ${genre} movies.`;

    res.json({
        fulfillmentMessages: [
            {
                text: { text: [responseText] }
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
