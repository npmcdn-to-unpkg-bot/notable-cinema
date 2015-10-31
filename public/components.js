const {Router, Route, Link} = ReactRouter

const Notable = React.createClass({
  render: function() {
    return (
      <div className="container">
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to="#" className="navbar-brand">Notable Cinema</Link>
            </div>
            <MovieSearch/>
            <UserBox/>
          </div>
        </nav>
        {this.props.children}
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
    return { data: [] }
  },
  change: function(event){  /* this still gives error for strings not found - return a notice? */
    if(event.target.value && event.target.value.length > 1){
      $.ajax({
        url: '/search/' + event.target.value,
        method: 'GET',
        success: function(results){
          this.setState({data: results})
        }.bind(this)
      })
    } else {
      this.setState({data: []}) // this still gives errors in render - can't find values
    }
  },
  render: function(){
    var searchResults = this.state.data.map( function(movie){
      return <MovieSearchResult key={movie.id} title={movie.title} id={movie.id} date={movie.release_date}></MovieSearchResult>
    })
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
  render: function(){
    return (
      <li>
        <Link to={'/movie/'+this.props.id}>
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
      rating: null,
      tagList: '',
      movieNotes: ''
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
        this.setState({
          movieStaticInfo: <MovieStaticInfo
            runtime={this.state.runtime}
            year={this.state.release_date ? parseInt(this.state.release_date.slice(0,4)) : null }
            language={this.state.original_language}
            countries={this.state.production_countries}
            poster={this.state.poster_path}
            backdrop={this.state.backdrop_path}
          />,
          rating: <Rating movieId={this.state.id}/>,
          tagList: <TagList movieId={this.state.id}/>,
          movieNotes: <MovieNotes movieId={this.state.id}/>
        })
        console.log(result)
      }.bind(this)
    })
  },
  render: function() {
    return (
      <div>
        <div className="clearfix" id="movie-title-box">
          <h1 className="col rating-box">
            {this.state.rating}
          </h1>
          <h1 className="col">
            {this.state.title}
          </h1>
        </div>
        <div className="clearfix">
          {this.state.movieStaticInfo}
          {this.state.movieNotes}
        </div>
        {this.state.tagList}
        <RecList/>
      </div>
    )
  }
})

const TagList = React.createClass({
  getInitialState: function(){
    return {
      keywords: ['test', 'gorilla'],
      tags: [],
      suggestions: "Add something like 'cinematography', 'date movie', or 'jet packs'. What makes it notable to you? Go crazy!",
      tags: this.props.genres,
      movieId: this.props.movieId,
      tagItemList: []
    }
  },
  componentDidMount: function(){
    var tagsUrl = "/m/"+this.props.movieId+"/t"
    $.ajax({
      url: tagsUrl,
      method: 'GET',
      success: function(tags){
        console.log(tags)
        this.setState({
          tags: tags,
          movieId: this.props.movieId
        })
        var movieId = this.state.movieId
        var tagItemList = this.state.tags.map(function(tag){
          return <TagItem tag={tag.name} movieId={movieId} key={tag.name}/>
        })
        this.setState({ tagItemList: tagItemList })
        var keywordsUrl = 'http://api.themoviedb.org/3/movie/'+this.state.movieId+'/keywords'
        $.ajax({
          url: keywordsUrl,
          data: {api_key: "a0a2189f163ebecb522800168841d983"},
          method: 'GET',
          success: function(result){
            this.setState( {keywords: result.keywords} )
            var suggestions = this.state.keywords.map(function(keyword){ return "'"+keyword.name+"'" }).join(', ')
            this.setState({
              suggestions: "Some suggestions for this film are "
                + suggestions
                + ". You could also add something like 'cinematography', 'date movie', or 'jet packs'. What makes it notable to you? Go crazy!"
            })
          }.bind(this)
        })
      }.bind(this)
    })
  },
  render: function(){
    return (
      <div>
        <h3>Notable Because:</h3>
        {this.state.tagItemList}

        <form onSubmit={this.submit} className="form-inline">
          <div className="form-group">
            {/* <label htmlFor="add-tag">Add a Tag:</label> */}
            <input onChange={this.change('tag')} type="text" id="add-tag" className="form-control" aria-describedby="helpBlock"/>
            <button type="submit" className="btn btn-default">Add Tag</button>
          </div>
          <span id="add-tag" className="help-block">{this.state.suggestions}</span>
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
        // this.setState({data: results})
        // then clear the input and state.tag
      }.bind(this)
    })
  }
})

const TagItem = React.createClass({
  render: function(){
    return (
      <div className="clearfix tag-item panel panel-default">
        <h4 className="col rating-box"><Rating movieId={this.props.movieId} tag={this.props.tag}/></h4>
        <h4 className="col tag-name">{this.props.tag}</h4>
        <div className="col">Notes here they are notes they are really ridiculously long. Notes here they are notes they are really ridiculously long. Notes here they are notes they are really ridiculously long.</div>
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
      if(ratings){
        var ratingsWidget = ratings.map( function(dot){
          return <Rate title={dot[0]} movieId={movieId} key={dot[1]} tag={tag} rating={dot[1]} >{dot[2]}</Rate>
        })
      }
    }

    return (
      <span className="rating clearfix">
        {ratingsWidget}
      </span>
    )
  }
})

const Rate = React.createClass({
  getInitialState: function(){
    return {}
  },
  render: function(){
    return <span className="rating-dot" id={this.props.rating} title={this.props.title} onClick={this.click}>
      {this.props.children}
    </span>
  },
  click: function(e){
    if(!this.props.tag){
      var url = "/m/"+this.props.movieId+"/rate/"+this.props.rating
      console.log('NO tag')
    } else {
      var url = "/m/"+this.props.movieId+"/t/"+this.props.tag+"/rate/"+this.props.rating
      console.log('HAS tag')
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

const MovieStaticInfo = React.createClass({
  render: function(){
    if(this.props.poster){
      var posterUrl = "https://image.tmdb.org/t/p/w185/"+this.props.poster
    }
    var thisLang = this.props.language
    if(thisLang){
      var language = languageCodes.filter( function(lang){
        return lang.code == thisLang
      })[0].name
    }
    return (
      <div className="col poster-box" >
        <img className="poster" src={posterUrl}/>
        <p>Year: {this.props.year}</p>
        <p>Runtime: {this.props.runtime} minutes</p>
        <p>Language: {language ? language : ''}</p>
        <p>Countries: {this.props.countries ? this.props.countries.map( function(country){ return country.name } ).join(', ') : "" }</p>
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
      <Route path='/user/:id' component={User}></Route>
      <Route path='/movie/:id' component={Movie}>
        <Route component={TagList}>
          <Route component={TagItem}></Route>
        </Route>
      </Route>
      <Route path='/tag/:id' component={Tag}></Route>
  	</Route>
    <Route component={MovieSearch}>
      <Route component={MovieSearchResult}/>
    </Route>
  </Router>
), document.body)
