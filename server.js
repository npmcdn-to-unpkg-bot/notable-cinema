var express = require('express')
var parser = require('body-parser')
var path = require('path')
var app = express()

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.use('/', express.static(path.join(__dirname, 'public')))

app.set('port', 3000)

app.get('/', function(req, res) {
  res.send(React)
});

app.listen( app.get('port'), function() {
  console.log('listening... port %s', app.get('port') );
})
