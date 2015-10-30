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
        console.log( "Movie: ", result )
        this.setState( {data: result} )
      }.bind(this)
    })
  },
  render: function() {
    return (
      <div>
        <div className="clearfix" id="movie-title-box">
          <h1 className="col col-md-9">
            {this.state.data.title}
          </h1>
          <h1 className="col col-md-3 svg-container">
            <Rating
              path={"/movie/"+this.state.data.id}
              id={"film-"+this.state.data.id}
            />
          </h1>
        </div>
        <MovieStaticInfo
          runtime={this.state.data.runtime}
          year={this.state.data.release_date ? parseInt(this.state.data.release_date.slice(0,4)) : null }
          language={this.state.data.original_language}
          countries={this.state.data.production_countries}
          poster={this.state.data.poster_path}
          backdrop={this.state.data.backdrop_path}
        />
        <TagList
          genres={this.state.data.genres}
          id={this.state.data.id}
        />
        <RecList/>
      </div>
    )
  }
})

const Rating = React.createClass({
  render: function(){
    return (
      <div className="rating clearfix">
        <Link to={this.props.path+"/rate/5"} className="rate5 rating-dot shadowed" title="Quintissential">●</Link>
        <Link to={this.props.path+"/rate/4"} className="rate4 rating-dot shadowed" title="Very Important">●</Link>
        <Link to={this.props.path+"/rate/3"} className="rate3 rating-dot shadowed" title="Truly Notable">●</Link>
        <Link to={this.props.path+"/rate/2"} className="rate2 rating-dot shadowed" title="Mildly Memorable">●</Link>
        <Link to={this.props.path+"/rate/1"} className="rate1 rating-dot shadowed" title="Nearly Negligible">●</Link>
        <Link to={this.props.path+"/rate/0"} className="rate0 rating-dot" title="Insignificant">◌</Link>
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
    language ? console.log(language) : console.log('not yet')
    return <div className="clearfix">
      <div className="col-md-3">
        <img className="poster" src={"https://image.tmdb.org/t/p/w185/"+this.props.poster}/>
      </div>
      <div className="col-md-9">
        <p>Year: {this.props.year}</p>
        <p>Runtime: {this.props.runtime} minutes</p>
        <p>Language: {language ? language : ''}</p>
        <p>Countries: {this.props.countries ? this.props.countries.map( function(country){ return country.name } ).join(', ') : "" }</p>
      </div>
    </div>
  }
})

const TagList = React.createClass({
  render: function(){
    var genres = this.props.genres
    var movieId = this.props.id
    if(genres && movieId){
      var tags = genres.map(function(tag){
        return (
          <TagItem tag={tag.name} path={"/movie/"+movieId+"/tag/"+tag.name} key={tag.id}/>
        )
      })
    }
    return (
      <div>
        <h3>List of Notable Tags here</h3>
        {tags}
      </div>
    )
  }
})

const TagItem = React.createClass({
  render: function(){
    return (
      <div className="clearfix tag-item panel panel-default">
        <div className="col-md-3"><Rating/></div>
        <div className="col-md-3">{this.props.tag}</div>
        <div className="col-md-6">Notes here</div>
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
