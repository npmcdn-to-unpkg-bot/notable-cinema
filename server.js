var express = require('express')
var parser = require('body-parser')
var path = require('path')
var mongo = require('mongodb')
var request = require('request')
var qs = require('querystring')
var sass = require('node-sass-middleware');
var app = express()

var current_user = {
  id: 007,
  name: "Jacob"
}


app.use( sass({
  src: path.join( __dirname, 'sass' ), //where the sass files are
  dest: path.join( __dirname, 'public' ), //where css should go
  debug: true
}))

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.set('port', 3000)
app.listen( app.get('port'), function() {
  console.log('listening... port %s', app.get('port') )
})

app.use('/', express.static(path.join(__dirname, 'public')))

var client = mongo.MongoClient
client.connect('mongodb://localhost:27017/notable', function(error, db) {
  if(error){ console.log(error) } else { console.log('okay') }

  app.get('/search/:title', function(req,res){
    var searchString = req.params.title
    var fullUrl = 'http://api.themoviedb.org/3/search/movie?' + qs.stringify({
      query: searchString,
      api_key: "a0a2189f163ebecb522800168841d983",
      include_adult: false
    })
    request({
      method: 'GET',
      url: fullUrl,
      headers: { 'Accept': 'application/json' }
    },
    function (error, response, body) {
      console.log('Status:', response.statusCode);
      // console.log('Headers:', JSON.stringify(response.headers));
      console.log('Response:', JSON.parse(body).results[0].title );
      if(JSON.parse(body).results){
        res.send(JSON.parse(body).results)
      } else {
        res.send([])
      }
    })
  })

  app.post('/m/:movieId/t/:tag/add', function(req, res){
    console.log('making new tag:', req.params.tag)
    var tag = req.params.tag.toLowerCase()
    db.collection('tags').update(
      { name: tag, movieId: req.params.movieId },
      { name: tag, movieId: req.params.movieId },
      { upsert: true },
      function( error ){
        error ? res.send( error ) : res.send( 'cool' )
      }
    )
  })

  app.get('/m/:movieId/t', function(req,res){
    console.log('listing tags for movie', req.params.movieId)
    db.collection('tags').find(
      { movieId: req.params.movieId }
    ).toArray( function( error, tags ){
      console.log(error, tags)
      res.send(tags)
      // res.send( tags )
    })
  })

  app.post('/m/:movieId/rate/:rating', function(req, res) {
    console.log('okay okay')
    db.collection('movies').update(
      { movieId: req.params.movieId },
      { $push: { ratings: { rating: req.params.rating, userId: 007 } } },
      { upsert: true },
      function( error ){
        error ? res.send( error ) : res.send( 'cool' )
      }
    )
  })

  app.post('/m/:movieid/t/:tag/rate/:rating', function(req, res) {
    console.log('okay okay')
    var tag = req.params.tag.toLowerCase()
    db.collection('tags').update(
      { name: tag, movieId: req.params.movieId },
      { $push: { ratings: { rating: req.params.rating, userId: 007 } } },
      { upsert: true },
      function( error ){
        error ? res.send( error ) : res.send( 'cool' )
      }
    )
  })

})
