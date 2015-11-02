const {Router, Route, Link} = ReactRouter

const Notable = React.createClass({
  getInitialState: function(){
    return {background: "indie"}
  },
  change: function(){
    return
  },
  render: function() {
    return <div className={"home "+this.state.background}>
      <div className="container navbar-container">
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to="/home" className="navbar-brand">Notable Cinema</Link>
            </div>
            <MovieSearch background={this.state.background}/>
            <UserBox/>
          </div>
        </nav>
      </div>
      {this.props.children}
    </div>
  }
})

const Home = React.createClass({
  render: function(){
    // var randNum = "backdrop" + Math.ceil(Math.random()*4)
    return <div className={"jumbotron front-page"}>
      <div className="container">
        <h1>Notable Cinema</h1>
        <h2>films to talk about</h2>
      </div>
    </div>
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
    return {}
  },
  change: function(event){  /* this still gives error for strings not found - return a notice? */
    if(event.target.value && event.target.value.length > 1){
      $.ajax({
        url: '/search/' + event.target.value,
        method: 'GET',
        success: function(results){
          this.setState({
            data: results
          })
        }.bind(this)
      })
    }
  },
  render: function(){
    var background = this.state.background
    if(this.state.data){
      var searchResults = this.state.data.map( function(movie){
        return <MovieSearchResult background={background} key={movie.id} title={movie.title} id={movie.id} date={movie.release_date}></MovieSearchResult>
      })
    } else {
      var searchResults = []
    }
    return (
      <form onChange={this.change} className="navbar-form navbar-left" role="search">
        <div className="form-group dropdown">
          <input type="text" className="form-control" id="film-search" placeholder="Film Search" aria-haspopup="true" aria-expanded="false"></input>
          <ul className="dropdown-menu" id="film-results"> {/* this should be changed to a content form */}
            {searchResults}
          </ul>
        </div>
      </form>
    )
  }
})

const MovieSearchResult = React.createClass({
  change: function(){
    this.setState({background: ''})
  },
  render: function(){
    return (
      <li>
        <Link to={'/movie/'+this.props.id} ref={this.change}>
          {this.props.title}{ this.props.date ? " ("+this.props.date.slice(0,4)+")" : "" }
        </Link>
      </li>
    )
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
      backdropUrl: ''
    }
  },
  componentDidMount: function(){
    var movieId = this.props.params.id
    $.ajax({
      url: 'http://api.themoviedb.org/3/movie/'+movieId,
      data: {api_key: "a0a2189f163ebecb522800168841d983"},
      method: 'GET',
      success: function(result){
        this.setState(result)
        var movieUrl = "/m/"+movieId
        $.ajax({
          url: movieUrl,
          method: 'GET',
          success: function(movie){
            console.log('movie object:', movie)
            if(movie.ratings){
              console.log('doing something')
              var averageRating = (function(){
                var sum = 0
                for(var i=0; i<movie.ratings.length; i++){
                  sum += movie.ratings[i].rating
                }
                return sum / movie.ratings.length
              })()
            } else {
              var averageRating = null;
            }
            this.setState({
              averageRating: averageRating,
              movieId: movieId
            })
            console.log("movie's average rating:", this.state.averageRating)
          }.bind(this)
        })
      }.bind(this)
    })
  },
  render: function() {
    var backdropUrl = "https://image.tmdb.org/t/p/w780/"+this.state.backdrop_path
    return (
      <div>
        <div className="container clearfix bg-color movie-title-box">
          <div className="col-sm-4 col-md-3 rating-box">
            <h1>
              <Rating movieId={this.props.params.id} averageRating={this.state.averageRating}/>
            </h1>
          </div>
          <div className="col-sm-8 col-md-9">
            <h1 className="title">{this.state.title}</h1>
            <MovieStaticInfo
              runtime={this.state.runtime}
              year={this.state.release_date ? parseInt(this.state.release_date.slice(0,4)) : null }
              language={this.state.original_language}
              countries={this.state.production_countries}
            />
          </div>
        </div>
        <HeaderImage url={backdropUrl} />
        <div className="container clearfix bg-color main-page">
          <Poster poster={this.state.poster_path} />
          <TagList movieId={this.props.params.id} />
        </div>
      </div>
    )
  }
})

const HeaderImage = React.createClass({
  render: function(){
    return <div className="xs-only">
      <img className="header-image" src={this.props.url}/>
    </div>
  }
})

const TagList = React.createClass({
  getInitialState: function(){
    return {
      keywords: [],
      tags: [],
      suggestions: "Add something like 'cinematography', 'date movie', or 'jet packs'. What makes it notable to you? Go crazy!",
      tags: [],
      movieId: 0,
      tagItemList: []
    }
  },
  componentDidMount: function(){
    var tagsUrl = "/m/"+this.props.movieId+"/t"
    console.log("url:", tagsUrl)
    $.ajax({
      url: tagsUrl,
      method: 'GET',
      success: function(tags){
        this.setState({
          tags: tags,
          movieId: this.props.movieId,
        })
        var keywordsUrl = 'http://api.themoviedb.org/3/movie/'+this.props.movieId+'/keywords'
        $.ajax({
          url: keywordsUrl,
          data: {api_key: "a0a2189f163ebecb522800168841d983"},
          method: 'GET',
          success: function(result){
            this.setState( {keywords: result.keywords.map(function(keyword){ return "'"+keyword.name+"'" }).join(', ')} )
          }.bind(this)
        })
      }.bind(this)
    })
  },
  render: function(){
    var tagsUrl = "/m/"+this.props.movieId+"/t"
    if(this.state.tags.length > 0){
      var tagItemList = this.state.tags.map(function(tag){
        console.log("tag object:", tag)
        if(tag.ratings){
          var averageRating = (function(){
            var sum = 0
            for(var i=0; i<tag.ratings.length; i++){
              sum += tag.ratings[i].rating
            }
            return sum / tag.ratings.length
          })()
        } else {
          var averageRating = null;
        }
        return <TagItem tag={tag.name} movieId={tag.movieId} key={tag.name} averageRating={averageRating}/>
      })
    }
    if(this.state.keywords.length > 0){
      var suggestions = "Some suggestions for this film are "
        + this.state.keywords
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
  render: function(){
    return (
      <div className="tag-item panel panel-default">
        <div className="clearfix">
          <h4 className="inline-block">
            <Rating movieId={this.props.movieId} tag={this.props.tag} averageRating={this.props.averageRating}/>
          </h4>
          <h4 className="tag-name inline-block">{this.props.tag}</h4>
        </div>
        <div className="notes">Notes here they are notes they are really ridiculously long. Notes here they are notes they are really ridiculously long. Notes here they are notes they are really ridiculously long.</div>
      </div>
    )
  }
})

const Rating = React.createClass({

  render: function(){

    if(this.props.movieId){
      var ratings = [
        ["Quintissential", 5, "●"],
        ["Very Important", 4, "●"],
        ["Truly Notable", 3, "●"],
        ["Mildly Memorable", 2, "●"],
        ["Nearly Negligible", 1, "●"],
        ["Insignificant", 0, "◌"]
      ]
      var movieId = this.props.movieId
      var tag = this.props.tag
      if(this.props.averageRating){var averageRating = Math.round(this.props.averageRating*10)/10}
      if(ratings){
        var ratingsWidget = ratings.map( function(dot){
          return <Rate title={dot[0]} movieId={movieId} key={dot[1]} tag={tag} rating={dot[1]} averageRating={averageRating} >{dot[2]}</Rate>
        })
      }
    }

    return (
      <div className="rating-box">
        <div className="rating clearfix">
          {ratingsWidget}
        </div>
        <div className='info-text'>{averageRating ? 'average rating: '+averageRating : '' }</div>
      </div>
    )
  }
})

const Rate = React.createClass({
  getInitialState: function(){
    return {}
  },
  render: function(){
    if( this.props.rating > 0 && this.props.rating <= Math.round(this.props.averageRating) ){
      var classes = "rating-dot selectified"
    } else {
      var classes = "rating-dot"
    }
    return <span className={classes} id={this.props.rating} title={this.props.title} onClick={this.click}>
      {this.props.children}
    </span>
  },
  click: function(e){
    if(!this.props.tag){
      var url = "/m/"+this.props.movieId+"/rate/"+this.props.rating
      console.log('rating a movie')
    } else {
      var url = "/m/"+this.props.movieId+"/t/"+this.props.tag+"/rate/"+this.props.rating
      console.log('rating a tag')
    }
    console.log( url )
    $.ajax({
      url: url,
      method: 'POST',
      success: function(results){
        console.log(results)
        // this.setState(results)
      }.bind(this)
    })
  }
})

const Poster = React.createClass({
  render: function(){
    if(this.props.poster){
      var posterUrl = "https://image.tmdb.org/t/p/w396/"+this.props.poster
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
    return (
      <div className="movie-info">
        {this.props.year} • {this.props.runtime} minutes
        {language ? " • Language: "+language : ''}
        {this.props.countries ? this.props.countries.length > 1 ? " • Countries: " : " • Country: " : ""}{this.props.countries ? this.props.countries.map( function(country){ return country.name } ).join(', ') : "" }
      </div>
    )
  }
})

const MovieNotes = React.createClass({

  render: function(){
    return <div>Movie Notes Here.</div>
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

// const Login;
// const Person;
// const NoteList;
// const NoteItem;

// const MovieList;
// const MovieItem;

// const PersonItem;

// const Rec;

React.render((
  <Router>
  	<Route path='/' component={Notable}>
      <Route path='/home' component={Home}/>
      <Route path='/movie/:id' component={Movie}/>
  	</Route>
  </Router>
), document.body)
