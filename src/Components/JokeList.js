import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css';

class JokeList extends Component {
	static defaultProps = {
		numJokesToGet: 10
	};
	constructor(props) {
		super(props);
		this.state = {
			jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
			loading: false
		};
		this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
		console.log(this.seenJokes);
		this.handleClick = this.handleClick.bind(this);
	}
	componentDidMount() {
		//get jokes only if theres no jokes when component renders
		if (this.state.jokes.length === 0) this.getJokes();
	}

	async getJokes() {
		try {
			//set empty array for new jokes
			let jokes = [];
			//search for new jokes until jokes.length is 10
			while (jokes.length < this.props.numJokesToGet) {
				//send req to api and change header per api docs to get json
				let res = await axios.get('https://icanhazdadjoke.com/', {
					headers: { Accept: 'application/json' }
				});
				let newJoke = res.data.joke;
				//check seenJoke Set for newly loaded jokes
				if (!this.seenJokes.has(newJoke)) {
					jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
				} else {
					console.log('FOUND A DUPLICATE!');
					console.log(newJoke);
				}
			}
			this.setState(
				//add new jokes to current jokes in state, set load to false
				(st) => ({
					loading: false,
					jokes: [ ...st.jokes, ...jokes ]
				}),
				//set the jokes to localstorage
				() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
			);
		} catch (e) {
			alert(e);
			//set loading back to false to avoid infinite spinner if error
			this.setState({ loading: false });
		}
	}
	handleVote(id, delta) {
		this.setState(
			(st) => ({
				//map over jokes to match id and update vote count
				jokes: st.jokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
			}),
			() => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
		);
	}
	handleClick() {
		//show loading icon while running getJokes
		this.setState({ loading: true }, this.getJokes);
	}
	render() {
		//show loading spinner if loading
		if (this.state.loading) {
			return (
				<div className="JokeList-spinner">
					<i className="far fa-8x fa-laugh fa-spin" />
					<h1 className="JokeList-title">Loading...</h1>
				</div>
			);
		}
		//sort joke based on votes
		let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
		return (
			<div className="JokeList">
				<div className="JokeList-sidebar">
					<h1 className="JokeList-title">
						<span>Dad</span> Jokes
					</h1>
					<img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
					<button className="JokeList-getmore" onClick={this.handleClick}>
						More Jokes
					</button>
				</div>

				<div className="JokeList-jokes">
					{jokes.map((j) => (
						<Joke
							key={j.id}
							votes={j.votes}
							text={j.text}
							upvote={() => this.handleVote(j.id, 1)}
							downvote={() => this.handleVote(j.id, -1)}
						/>
					))}
				</div>
			</div>
		);
	}
}
export default JokeList;
