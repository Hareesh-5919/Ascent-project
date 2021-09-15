const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () =>
      console.log("Server Running at http://localhost:3005/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};



//api to post a movie
app.post("/movies/", async (request, response) => {
  const { movieId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
      movies ( movie_id, movie_name, lead_actor)
    VALUES
      (${movieId}, '${movieName}', '${leadActor}');`;
  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//api to get a movie
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movies;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
  

//api to get particulat movies  
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movies
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});  


//api to update a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
              movies
            SET
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});


//api to delete  movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movies
  WHERE
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});


module.exports = app;
