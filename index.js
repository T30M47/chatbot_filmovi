const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const csv = require('csv-parser');

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Webhook Server is Running!');
});

function getMoviesByActor(actorName) {
    const movies = [];
    fs.createReadStream('actors.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (
                row.actor1.toLowerCase().includes(actorName.toLowerCase()) ||
                row.actor2.toLowerCase().includes(actorName.toLowerCase()) ||
                row.actor3.toLowerCase().includes(actorName.toLowerCase())
            ) {
                movies.push(row.movie);
            }
        })
        .on('end', () => {
            if (movies.length > 0) {
                return movies;
            } else {
                return `Sorry, I couldn't find any movies with ${actorName}.`;
            }
        });
}

function extractActorFromQuery(query, actorsList) {
    for (const actor of actorsList) {
        if (query.toLowerCase().includes(actor.toLowerCase())) {
            return actor;
        }
    }
    return null;
}

function loadActors(callback) {
    const actorsSet = new Set();
    fs.createReadStream('actors.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (row.actor1) actorsSet.add(row.actor1.trim());
            if (row.actor2) actorsSet.add(row.actor2.trim());
            if (row.actor3) actorsSet.add(row.actor3.trim());
        })
        .on('end', () => {
            callback(Array.from(actorsSet));
        });
}

// URL for webhook
app.post('/webhook', (req, res) => {
    // Fetch the genre from request parameters or output context
    let genre = req.body.queryResult?.parameters?.genre;
    let queryText = req.body.queryResult?.queryText;
    let actorName = extractActorFromQuery(queryText);

    loadActors((actorsList) => {
        let actorName = extractActorFromQuery(queryText, actorsList); // Extract actor name from query text

        let responseText;

        if (intent === 'search_movies_by_actor') {
            // If the intent is search_movies_by_actor, proceed with the actor search
            if (actorName) {
                getMoviesByActor(actorName, (error, movies) => {
                    if (error) {
                        responseText = error;
                    } else {
                        responseText = `Here are the movies with ${actorName}: ${movies.join(', ')}`;
                    }

                    // Send the response back
                    res.json({
                        fulfillmentMessages: [
                            {
                                text: { text: [responseText] }
                            }
                        ]
                    });
                });
            } else {
                responseText = "Please specify the actor you are interested in.";
                res.json({
                    fulfillmentMessages: [
                        {
                            text: { text: [responseText] }
                        }
                    ]
                });
            }
        }/* else {
            // Handle other intents (e.g., genre search)
            responseText = "Sorry, I couldn't understand the request.";
            res.json({
                fulfillmentMessages: [
                    {
                        text: { text: [responseText] }
                    }
                ]
            });
        }*/
    });

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
            "Some of the most popular action movies on our platform are: Matrix, The Dark Knight, John Wick, and Gladiator."
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

    const intent = req.body.queryResult?.intent?.displayName;
    let responseText;

    if (intent === 'get_popularmovies_genre') {
                // Return context-based popular movies response
                console.log(`Returning context-based response for genre: ${genre}`);
                responseText = genreContextResponses[genre.toLowerCase()]?.[0] || `Sorry, I don't have popular movies for ${genre}.`;
    } else {

                // Return genre-based movie list (normal genre-based question)
                console.log(`Returning normal genre-based response for genre: ${genre}`);
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
                lifespanCount: 1,
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
