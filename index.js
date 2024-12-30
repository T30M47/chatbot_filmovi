const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Webhook Server is Running!');
});

// URL for webhook
app.post('/webhook', (req, res) => {
    // Fetch the genre from request parameters or output context
    let genre = req.body.queryResult?.parameters?.genre;

    // Check if genre exists in parameters, otherwise, check context
    if (!genre) {
        const context = req.body.queryResult?.outputContexts;
        const genreContext = context?.find(ctx => ctx.name.includes('genre'));

        if (genreContext) {
            genre = genreContext.parameters?.genre;
        }
    }

    // If genre is still undefined, return a response asking for the genre
    if (!genre) {
        console.log('No genre found in request parameters or context.');
        return res.json({
            fulfillmentMessages: [
                {
                    text: { text: ["Please tell me the genre you are interested in."] }
                }
            ]
        });
    }

    // Define genre movie recommendations
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

    // Define context-based responses (only for popular movies)
    const genreContextResponses = {
        action: [
            "Some of the most popular action movies on our platform are: Matrix, The Dark Knight, John Wick and Gladiator."
        ],
        drama: [
            "Some of the most popular drama movies on our platform are: The Godfather, Forrest Gump, Intouchables"
        ],
        horror: [
            "Some of the most popular horror movies on our platform are: Jaws, The Shining, Psycho"
        ],
        comedy: [
            "Some of the most popular comedy movies on our platform are: La vita è bella, Modern Times, Home Alone"
        ],
        adventure: [
            "Some of the most popular adventure movies on our platform are: Inception, Interstellar, The Lion King"
        ],
        thriller: [
            "Some of the most popular thriller movies on our platform are: Seven, The Prestige, The Departed"
        ],
        scifi: [
            "Some of the most popular sci-fi movies on our platform are: The Terminator, The Thing, Logan"
        ]
    };

    // Check if the intent is asking for popular movies (context-based question)
    const isPopularMoviesQuestion = req.body.queryResult?.inputContexts?.some(context =>
        context.name.includes('genre') && context.parameters?.genre
    );


    let responseText;

    if (isPopularMoviesQuestion) {
        // Return context-based popular movies response
        responseText = genreContextResponses[genre.toLowerCase()]?.[0] || `Sorry, I don't have popular movies for ${genre}.`;
    } else {
        // Return genre-based movie list (normal genre-based question)
        responseText = genreMovies[genre.toLowerCase()]
            ? genreMovies[genre.toLowerCase()][Math.floor(Math.random() * genreMovies[genre.toLowerCase()].length)]
            : `Sorry, I don't have recommendations for ${genre} movies.`;
    }

    // Send response with genre-based or context-based movie recommendations
    res.json({
        fulfillmentMessages: [
            {
                text: { text: [responseText] }
            }
        ],
        // Maintain the genre context to allow further genre-specific questions
        outputContexts: [
            {
                name: req.body.session + '/contexts/genre',
                lifespanCount: 2,
                parameters: {
                    genre: genre
                }
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
