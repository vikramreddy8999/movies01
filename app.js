const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("sever running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DbError:${e.message}`);
    process.exit(1);
  }
};
initializeAndDb();

const convertMovieObjectToResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movie = `
    SELECT movie_name
    FROM movie`;
  const movieArray = await ad.all(movie);
  response.send(
    movieArray.map((eachArray) => ({ movieName: eachArray.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { movieName, leadActor } = details;
  const addDetails = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
VALUES    
(${directorId},'${movieName}',
    '${leadActor}');`;

  const addMovie = await db.run(addDetails);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT *
    FROM movie
    WHERE movie_id=${movieId}`;
  const movie = await db.get(getMovie);
  response.send(convertMovieObjectToResponse(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `
    UPDATE
    movie
    SET
    director_id:${directorId},
    movie_name:'${movieName}',
    lead_actor:'${leadActor}'
    WHERE
    movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
    movie
    WHERE 
    movie_id=${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorDetails = `
     SELECT *
     FROM director`;
  const director = await db.all(directorDetails);
  response.send(
    director.map((eachDirector) =>
      convertDirectorObjectToResponse(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirected = `
    SELECT movie_name
    FROM 
    movie
    WHERE director_id='${directorId}';`;

  const moviesArray = await db.all(getMovieDirected);
  response.send(moviesArray.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
