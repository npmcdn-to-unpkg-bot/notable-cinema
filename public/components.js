const {Router, Route, Link, IndexRoute, History} = ReactRouter

var averageTheseRatings = function(arr){
  var sum = 0
  for(var i=0; i<arr.length; i++){
    sum += arr[i].rating
  }
  return Math.round( (sum / arr.length) * 10 ) / 10
}

const Notable = React.createClass({
  mixins: [History],
  getInitialState: function() {
    return {movieId: null}
  },
  handleMovieSelect: function(movie){
    var movieUrl = '/movie/'+movie.movieId
    this.setState({movieId: movie.movieId})
    this.history.pushState(null, movieUrl )
  },
  render: function() {
    return (
      <div className="wrapper">
        <div className="background"></div>
        <div className="container navbar-container">
          <nav className="navbar navbar-default">
            <div className="container-fluid">
              <div className="navbar-header">
                <Link to="/" className="navbar-brand">Notable Cinema</Link>
              </div>
                <MovieSearch onMovieSelect={this.handleMovieSelect}/>
              <UserBox/>
            </div>
          </nav>
        </div>
        {this.props.children}
      </div>
    )
  }
})

const Home = React.createClass({
  // componentDidMount: function(){
  //   this.props.onAtHome({ background: '/crusade.png' })
  // },
  // componentWillUnmount: function(){
  //   this.props.onAtHome({ background: '' })
  // },
  render: function(){
    return (
      <div className="jumbotron front-page">
        <div className="container">
          <h1>Notable Cinema</h1>
          <h2>films to talk about</h2>
        </div>
      </div>
    )
  }
})

const UserBox = React.createClass({
  render: function() {
    return (
      <ul className="nav navbar-nav navbar-right">
        <li className="dropdown">
        <Link to="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Log In <span className="caret"></span></Link>
        <ul className="dropdown-menu">
          <li><Link to="#">Log In with Facebook</Link></li> {/* connect oauth here - swap login / user options (modal?) & logout */}
        </ul>
        </li>
      </ul>
    )
  }
})

const MovieSearch = React.createClass({
  getInitialState: function() {
    return {results: [], value: ''}
  },
  change: function(event){
    if(event.target.value && event.target.value.length > 1){
      $.ajax({
        method: 'GET',
        url: 'https://api.themoviedb.org/3/search/movie',
        data: {
          query: event.target.value,
          api_key: "a0a2189f163ebecb522800168841d983",
          include_adult: false
        },
        success: function(body){
          this.setState({results: body.results})
        }.bind(this)
      })
    }
  },
  render: function(){
      var searchResults = this.state.results.map( function(movie){
        return (
          <li key={movie.id}>
            <Link to={"/movie/"+movie.id} id={movie.id} onClick={this.handleSubmit}>
              {movie.title}{ movie.release_date ? " ("+movie.release_date.slice(0,4)+")" : "" }
            </Link>
          </li>
        )
      }.bind(this))
    var value = this.state.value;
    return (
      <form onChange={this.change} onSubmit={this.handleSubmit} className="navbar-form navbar-left" id="film-search-form" role="search">
        <div className="form-group dropdown">
          <input onChange={this.input} type="text" className="form-control" id="film-search" placeholder="Film Search" autoComplete="off" value={value} aria-haspopup="true" aria-expanded="true"></input>
          <ul className="dropdown-menu" id="film-results" aria-labelledby="film-search">
            {searchResults}
          </ul>
        </div>
      </form>
    )
  },
  input: function(event){
    this.setState({value: event.target.value})
  },
  handleSubmit: function(event){
    event.preventDefault()
    console.log('set id to', $('.active-option')[0].id )
    this.props.onMovieSelect({movieId: $('.active-option')[0].id})
    this.setState({results: [], value: ''})
  }
})

const Movie = React.createClass({
  getInitialState: function(){
    return {
      movieStaticInfo: '',
      tagList: '',
      movieNotes: '',
      averageRating: null,
      ratings: [],
      notes: [],
      backdropUrl: '',
      movieId: this.props.params.id
    }
  },
  componentDidMount: function(){
    var movieId = this.props.params.id
    console.log('initial set movieId for movie', movieId)
    $.ajax({
      url: 'https://api.themoviedb.org/3/movie/'+movieId,
      data: {api_key: "a0a2189f163ebecb522800168841d983"},
      method: 'GET',
      success: function(result){
        this.setState(result)
        $.ajax({
          url: "/m/"+movieId,
          method: 'GET',
          success: function(movie){
            console.log('movie object:', movie)
            if(movie.ratings){
              console.log('doing something')
              var averageRating = averageTheseRatings(movie.ratings)
            } else {
              var averageRating = null;
            }
            this.setState({
              averageRating: averageRating
            })
            console.log("movie's average rating:", this.state.averageRating)
          }.bind(this)
        })
      }.bind(this)
    })
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      movieStaticInfo: '',
      tagList: '',
      movieNotes: '',
      averageRating: null,
      ratings: [],
      notes: [],
      backdropUrl: '',
      movieId: this.props.params.id
    })
    var movieId = nextProps.params.id
    $.ajax({
      url: 'https://api.themoviedb.org/3/movie/'+movieId,
      data: {api_key: "a0a2189f163ebecb522800168841d983"},
      method: 'GET',
      success: function(result){
        this.setState(result)
        $.ajax({
          url: "/m/"+movieId,
          method: 'GET',
          success: function(movie){
            console.log('movie object:', movie)
            if(movie.ratings){
              console.log('doing something')
              var averageRating = averageTheseRatings(movie.ratings)
            } else {
              var averageRating = null;
            }
            this.setState({
              averageRating: averageRating
            })
            console.log("movie's average rating:", this.state.averageRating)
          }.bind(this)
        })
      }.bind(this)
    })
  },
  render: function() {
    var backdropUrl = "https://image.tmdb.org/t/p/w780/"+this.state.backdrop_path
    var state = this.state
    return (
      <div className="movie-container">
        <div className="container clearfix bg-color movie-title-box">
          <div className="col-sm-4 col-md-3 rating-box">
            <h1>
              <Rating movieId={state.movieId} averageRating={state.averageRating}/>
            </h1>
          </div>
          <div className="col-sm-8 col-md-9">
            <h1 className="title">{state.title}</h1>
            <MovieStaticInfo
              runtime={state.runtime}
              year={state.release_date ? parseInt(state.release_date.slice(0,4)) : null }
              language={state.original_language}
              countries={state.production_countries}
            />
          </div>
        </div>
        <div className="xs-only">
          <img className="header-image" src={backdropUrl}/>
        </div>
        <div className="container clearfix bg-color main-page">
          <Poster poster={state.poster_path} />
          <TagList movieId={state.movieId} />
        </div>
      </div>
    )
  }
})

const TagList = React.createClass({
  getInitialState: function(){
    return {
      keywords: '',
      tags: [],
      suggestions: '',
      movieId: this.props.movieId
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      movieId: nextProps.movieId,
      suggestions: ''
    })
    var movieId = nextProps.movieId
    var tagsUrl = "/m/"+movieId+"/t"
    console.log("url:", tagsUrl)
    $.ajax({
      url: tagsUrl,
      method: 'GET',
      success: function(tags){
        this.setState({
          tags: tags
        })
        var keywordsUrl = 'https://api.themoviedb.org/3/movie/'+movieId+'/keywords'
        $.ajax({
          url: keywordsUrl,
          data: {api_key: "a0a2189f163ebecb522800168841d983"},
          method: 'GET',
          success: function(result){
            this.setState({
              keywords: result.keywords.map(function(keyword){ return "'"+keyword.name+"'" }).join(', ')
            })
          }.bind(this)
        })
      }.bind(this)
    })
  },
  componentDidMount: function(){
    this.setState({ movieId: this.props.movieId })
    var movieId = this.props.movieId
    var tagsUrl = "/m/"+movieId+"/t"
    console.log("url:", tagsUrl)
    $.ajax({
      url: tagsUrl,
      method: 'GET',
      success: function(tags){
        this.setState({
          tags: tags
        })
        var keywordsUrl = 'https://api.themoviedb.org/3/movie/'+movieId+'/keywords'
        $.ajax({
          url: keywordsUrl,
          data: {api_key: "a0a2189f163ebecb522800168841d983"},
          method: 'GET',
          success: function(result){
            this.setState({
              keywords: result.keywords.map(function(keyword){ return "'"+keyword.name+"'" }).join(', ')
            })
          }.bind(this)
        })
      }.bind(this)
    })
  },
  render: function(){
    var movieId = this.state.movieId
    var tags = this.state.tags
    if(tags.length > 0){
      var tagItemList = tags.map( function(tag){
        var averageRating = null
        console.log("tag object:", tag)
        if(tag.ratings){
          averageRating = averageTheseRatings( tag.ratings )
        }
        return <TagItem movieId={movieId} tag={tag.name} movieId={tag.movieId} key={tag.name} notes={tag.notes} averageRating={averageRating}/>
      })
    }
    var keywords = this.state.keywords
    if(keywords){
      var suggestions = "Some suggestions for this film are "
        + keywords
        + ". You could also add something like 'cinematography', 'date movie', or 'jet packs'. What makes it notable to you? Go crazy!"
    } else {
      var suggestions = "Add something like 'cinematography', 'date movie', or 'jet packs'. What makes it notable to you? Go crazy!"
    }
    return (
      <div className="col-sm-8 col-md-9">
        <h3 className="tags-title">Notable Because:</h3>
        {tagItemList}

        <form onSubmit={this.submit} className="form-inline">
          <div className="form-group">
            {/* <label htmlFor="add-tag">Add a Tag:</label> */}
            <input onChange={this.change('tag')} type="text" id="add-tag" className="form-control" aria-describedby="helpBlock"/>
            &nbsp;
            <button type="submit" className="btn btn-default">Add Tag</button>
          </div>
          <span id="add-tag" className="help-block">{suggestions}</span>
        </form>

      </div>
    )
  },
  change: function(key){
    return function(e){
      var state = {}
      state[key] = e.target.value
      this.setState(state)
    }.bind(this)
  },
  submit: function(e){
    e.preventDefault()
    console.log("adding tag "+this.state.tag)
    var url = "/m/"+this.state.movieId+"/t/"+this.state.tag+"/add"
    $.ajax({
      url: url,
      method: 'POST',
      success: function(results){
        console.log(results)
        // then clear the input and state.tag
      }.bind(this)
    })
  }
})

const TagItem = React.createClass({
  getInitialState: function(){
    return { movieId: this.props.movieId }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      movieId: nextProps.movieId
    })
  },
  render: function(){
    var movieId = this.state.movieId
    var props = this.props
    return (
      <div className="tag-item panel panel-default">
        <div className="clearfix">
          <h4 className="inline-block">
            <Rating movieId={movieId} tag={props.tag} averageRating={props.averageRating}/>
          </h4>
          <h4 className="tag-name inline-block">{props.tag}</h4>
        </div>
        <NoteList movieId={movieId} tag={props.tag} notes={props.notes} />
      </div>
    )
  }
})

const NoteList = React.createClass({
  getInitialState: function(){
    return { movieId: this.props.movieId }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      movieId: nextProps.movieId
    })
  },
  render: function(){
    var movieId = this.state.movieId
    if(this.props.notes){
      var movieId = this.props.movieId
      var noteItemList = this.props.notes.map(function(note){
        console.log("note object:", note)
        return <NoteItem movieId={movieId} user={note.user} movieId={movieId} key={note._id} content={note.content}/>
      })
    }
    return <div>
      {noteItemList}
      <form onSubmit={this.submit} className="form">
        <div className="form-group">
          <input onChange={this.change('note')} type="text" id="add-note" className="form-control" placeholder="Make a Note"/>
          <button type="submit" className="btn btn-default btn-sm">Add Note</button>
        </div>
      </form>
    </div>
  },
  change: function(key){
    return function(e){
      var state = {}
      state[key] = e.target.value
      this.setState(state)
    }.bind(this)
  },
  submit: function(e){
    e.preventDefault()
    var props = this.props
    var note = this.state.note
    console.log("adding note "+note)
    var url = "/m/"+props.movieId+"/t/"+props.tag+"/n/"+note+"/add"
    $.ajax({
      url: url,
      method: 'POST',
      success: function(results){
        console.log(results)
        // then clear the input and state.tag
      }.bind(this)
    })
  }
})

const NoteItem = React.createClass({
  render: function(){
    var props = this.props
    return (
      <div className="note-item">
        <p className="note-text">{props.content} <span className="author"> — {props.user}</span></p>
      </div>
    )
  }
})

const Rating = React.createClass({
  render: function(){
    var props = this.props
    if(props.movieId){
      var ratings = [
        ["Quintissential", 5, "●"],
        ["Very Important", 4, "●"],
        ["Truly Notable", 3, "●"],
        ["Mildly Memorable", 2, "●"],
        ["Nearly Negligible", 1, "●"],
        ["Insignificant", 0, "◌"]
      ]
      if(ratings){
        var ratingsWidget = ratings.map( function(dot){
          return <Rate title={dot[0]} movieId={props.movieId} key={dot[1]} tag={props.tag} rating={dot[1]} averageRating={props.averageRating} >{dot[2]}</Rate>
        })
      }
    }

    return (
      <div className="rating-box">
        <div className="rating clearfix">
          {ratingsWidget}
        </div>
        <div className='info-text'>{ props.averageRating ? 'average rating: ' + props.averageRating : '' }</div>
      </div>
    )
  }
})

const Rate = React.createClass({
  render: function(){
    var props = this.props
    if( props.rating > 0 && props.rating <= Math.round(props.averageRating) ){
      var classes = "rating-dot selectified"
    } else {
      var classes = "rating-dot"
    }
    return <span className={classes} id={props.rating} title={props.title} onClick={this.click}>
      {this.props.children}
    </span>
  },
  click: function(e){
    var props = this.props
    var url
    if(!props.tag){
      url = "/m/"+props.movieId+"/rate/"+props.rating
      console.log('rating a movie')
    } else {
      url = "/m/"+props.movieId+"/t/"+props.tag+"/rate/"+props.rating
      console.log('rating a tag')
    }
    console.log( url )
    $.ajax({
      url: url,
      method: 'POST',
      success: function(results){
        console.log(results)
      }.bind(this)
    })
  }
})

const Poster = React.createClass({
  render: function(){
    var props = this.props
    if(props.poster){
      var posterUrl = "https://image.tmdb.org/t/p/w396/"+props.poster
    }
    return (
      <div className="poster-box col-sm-4 col-md-3">
        <img className="poster img-responsive img-rounded" src={posterUrl}/>
      </div>
    )
  }
})

const MovieStaticInfo = React.createClass({
  render: function(){
    var thisLang = this.props.language
    if(thisLang){
      var language = languageCodes.filter( function(lang){
        return lang.code == thisLang
      })[0].name
    }
    var props = this.props
    return <div className="movie-info">
      {props.year} • {props.runtime} minutes
      {language ? " • Language: "+language : ''}
      {props.countries ? props.countries.length > 1 ? " • Countries: " : " • Country: " : ""}{props.countries ? props.countries.map( function(country){ return country.name } ).join(', ') : "" }
    </div>

  }
})

const PeopleList = React.createClass({
  render: function(){
    return <h3>List of Notable People here</h3>
  }
})

const RecList = React.createClass({
  render: function(){
    return <h3>List of Recommendations here</h3>
  }
})

const User = React.createClass({
  render: function() {
    return (
      <div>
        <h2>{this.state.data.name}</h2>
        <p>Test user</p>
      </div>
    )
  }
})

const Tag = React.createClass({
  render: function() {
    return (
      <div>
        <h2>{this.state.data.name}</h2>
        <p>Test tag</p>
      </div>
    )
  }
})

React.render((
  <Router>
  	<Route path='/' component={Notable}>
      <IndexRoute component={Home}/>
      <Route path='/movie/:id' component={Movie}/>
  	</Route>
  </Router>
), document.body)
