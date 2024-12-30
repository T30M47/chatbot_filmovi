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
        ], 
        comedy: [
            "Here are some Comedy movies: Beetlejuice, Elf, Home Alone.",
            "Here are some Comedy movies: Meet the Fockers, Ratatouille, Red One.",
            "Here are some Comedy movies: Wonka, Anora, Scrooged."
        ], 
        adventure: [
            "Here are some Adventure movies: 2012, Avatar, Interstellar.",
            "Here are some Adventure movies: Jaws, Red One, Wonka.",
            "Here are some Adventure movies: Superman, Klaus, A Christmas Carol."
        ], 
        thriller: [
            "Here are some Thriller movies: Rebecca, Room, Homestead.",
            "Here are some Thriller movies: Apostle, Insidious, Pentagram.",
            "Here are some Thriller movies: Saw, The Visit, Conclave."
        ], 
        scifi: [
            "Here are some Sci-Fi movies: Avatar, Interstellar, Matrix.",
            "Here are some Sci-Fi movies: Source code, The Lazarus Effect, Elevation.",
            "Here are some Sci-Fi movies: Tenet, Blade Runner, Contact.",
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
