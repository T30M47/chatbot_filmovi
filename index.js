const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Webhook Server is Running!');
});

// url za webhook
app.post('/webhook', (req, res) => {
    // dohvaćanje žanra
    const genre = req.body.queryResult?.parameters?.genre; 

    // ako ne nađe žanr
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
        action: [
            "Here are some Action movies: Matrix, Gladiator, Avatar.",
            "Here are some Action movies: Twisters, Red One, Baby Driver.",
            "Here are some Action movies: Carry on, Gladiator, John Wick.",
        ],
        drama: [
            "Here are some Drama movies: Bohemian Rhapsody, Forrest Gump, Intouchables.",
            "Here are some Drama movies: Joker, Oppenheimer, The Lion King.",
            "Here are some Drama movies: Titanic, Orphan, Babygirl."
        ],
        horror: [
            "Here are some Horror movies: The Conjuring, Apostel, Do Not Breathe.",
            "Here are some Horror movies: Jaws, Hereditary, Nosferatu.",
            "Here are some Horror movies: The Substance, The Exorcism of Emile Rose, The ritual."
        ]
    };

    // Get a random response for the selected genre
    const genreResponse = genreMovies[genre.toLowerCase()];
    const responseText = genreResponse 
        ? genreResponse[Math.floor(Math.random() * genreResponse.length)] // Nasumićan izbor odgovora
        : `Sorry, I don't have recommendations for ${genre} movies.`;

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
