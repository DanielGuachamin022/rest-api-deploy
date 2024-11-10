const express = require('express')
const crypt = require('node:crypto')

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(express.json())
app.disable('x-powered-by')

//Todo recurso de movies se identifica con /movies
app.get('/movies', (req, res) => {
  res.header('Access-Control-Allow-Origin','*')
    const {genre} = req.query
    if(genre){
        const filterMovies = movies.filter(
            movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
        )
        return res.json(filterMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return res.json(movie)
    res.status(404).json({message: 'Movie not found'})
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
  
    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    // en base de datos
    const newMovie = {
      id: crypto.randomUUID(), // uuid v4
      ...result.data
    }
  
    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie)
  
    res.status(201).json(newMovie)
})

app.delete('/movies/id', (req, res) => {
  const {id} = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if(movieIndex === -1){
    return res.status(404).json({message: 'Movie not found'})
  }

  movies.splice(movieIndex, 1)

  return res.json({message: 'Movie deleted'})
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
  
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    const updateMovie = {
      ...movies[movieIndex],
      ...result.data
    }
  
    movies[movieIndex] = updateMovie
  
    return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () =>{
    console.log(`server listening on port http://localhost:${PORT}`)
})

//node --watch -/app.js -> permite guardar y recargar todo el proyecto

//CORS -> Permite que un registro sea restringido y solo funciona en navegadores
//Error de uso compartido entre dominios