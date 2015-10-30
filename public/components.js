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
    return {data: []}
  },
  componentDidMount: function(){
    var movieId = this.props.params.id
    $.ajax({
      url: 'http://api.themoviedb.org/3/movie/'+movieId,
      data: {api_key: "a0a2189f163ebecb522800168841d983"},
      method: 'GET',
      success: function(result){
        this.setState( {data: result} )
      }.bind(this)
    })
  },
  render: function() {
    return (
      <div>
        <div className="clearfix" id="movie-title-box">
          <h1 className="col rating-box">
            <Rating
              path={"/movie/"+this.state.data.id}
              id={"film-"+this.state.data.id}
            />
          </h1>
          <h1 className="col">
            {this.state.data.title}
          </h1>
        </div>
        <div className="clearfix">
          <MovieStaticInfo
            runtime={this.state.data.runtime}
            year={this.state.data.release_date ? parseInt(this.state.data.release_date.slice(0,4)) : null }
            language={this.state.data.original_language}
            countries={this.state.data.production_countries}
            poster={this.state.data.poster_path}
            backdrop={this.state.data.backdrop_path}
          />
          <MovieNotes
            movieId={this.state.data.id}
          />
        </div>
        <TagList
          genres={this.state.data.genres}
          path={"/ratemovietag/"+this.state.data.id}
          id={this.state.data.id}
        />
        <RecList/>
      </div>
    )
  }
})

const TagList = React.createClass({
  render: function(){

    if(this.props.id && this.props.genres){
      var tags = this.props.genres
      var movieId = this.props.id
      if(movieId){
        var tagItemList = tags.map(function(tag){
          return <TagItem tag={tag.name} movieId={movieId} key={tag.id}/>
        })
      }
    }

    return (
      <div>
        <h3>Notable Factors:</h3>
        {tagItemList}
        <button className="btn btn-default tag-add">Add Notable Factor</button>
      </div>
    )
  }
})

const Rating = React.createClass({

  render: function(){

    if(this.props){
      console.log(this.props)
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
  render: function(){
    return <span className="rating-dot" id={this.props.rating} title={this.props.title} onClick={this.click}>
      {this.props.children}
    </span>
  },
  getInitialState: function(){
    return {data: {}}
  },
  click: function(e){
    var url = "/movie/"+this.props.movieId+"/tag/"+this.props.tag+"/rate/"+this.props.rating
    console.log( url )
    $.ajax({
      url: url,
      method: 'GET',
      success: function(results){
        console.log(results)
        // this.setState({data: results})
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
  getInitialState: function(){
    return {data: []}
  },
  componentDidMount: function(){
    // $.ajax({
    //   url: 'http://api.themoviedb.org/3/movie/'+movieId,
    //   data: {api_key: "a0a2189f163ebecb522800168841d983"},
    //   method: 'GET',
    //   success: function(result){
    //     this.setState( {data: result} )
    //   }.bind(this)
    // })
  },
  render: function(){
    return <div>Movie Notes Here.</div>
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
      <Route path='/movie/:id' component={Movie}></Route>
      <Route path='/tag/:id' component={Tag}></Route>
  	</Route>
    <Route component={MovieSearch}>
      <Route component={MovieSearchResult}/>
    </Route>
  </Router>
), document.body)
