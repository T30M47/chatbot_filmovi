const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

// Baza podataka filmova s osnovnim informacijama
const moviesData = {
  "Inception": {
    year: 2010,
    plot: "Kradljivac koji ulazi u umove drugih kroz njihove snove dobiva zadatak posaditi ideju u um direktora velike korporacije.",
    rating: 8.8
  },
  "Titanic": {
    year: 1997,
    plot: "Mladi par iz različitih društvenih slojeva zaljubljuje se na brodu R.M.S. Titanic, koji je na putu prema nesreći.",
    rating: 7.8
  },
  "The Matrix": {
    year: 1999,
    plot: "Haker otkriva da je stvarnost koju poznaje simulacija koju kontroliraju mašine.",
    rating: 8.7
  }
};

// Webhook endpoint za Dialogflow
app.post('/webhook', (req, res) => {
  const movieTitle = req.body.queryResult.parameters.naslov_filma;

  // Provjeri postoji li film u bazi podataka
  if (moviesData[movieTitle]) {
    const movie = moviesData[movieTitle];
    // Vraćamo dinamički odgovor temeljen na naslovu filma
    res.json({
      fulfillmentText: `Film ${movieTitle} je izašao ${movie.year}. godine.\nRadnja: ${movie.plot}\nOcjena: ${movie.rating}`
    });
  } else {
    // Ako film nije pronađen u bazi, vratimo odgovarajuću poruku
    res.json({
      fulfillmentText: `Nažalost, nemam informacije o tom filmu.`
    });
  }
});

// Pokreni server
app.listen(port, () => {
  console.log(`Webhook server radi na portu ${port}`);
});
