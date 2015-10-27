const {Router, Route, Link} = ReactRouter;

const Notable = React.createClass({
  render: function() {
    return <h1>Hello</h1>
  }
})

const Movie;
const Person;
const User;
const NoteList;
const Note;
const TagList;
const TagItem;
const Rating;
const MovieList;
const MovieItem;
const PersonList;
const PersonItem;
const RecList;
const Rec;

React.render((
  <Router>
  	<Route path='/' component={Notable}>
  	</Route>
  </Router>
), document.body);
