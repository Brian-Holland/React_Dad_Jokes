import React, { Component } from 'react';
import axios from 'axios';

export class JokeList extends Component {
	static defaultProps = {
		numJokesToGet: 10
	};

	constructor(props) {
		super(props);
		this.state = { jokes: [] };
	}
	async componentDidMount() {
		//load jokes
		let jokes = [];
		//loop to get 10 jokes
		while (jokes.length < this.props.numJokesToGet) {
			//get a joke and change header to work with the api
			let res = await axios.get('https://icanhazdadjoke.com', { headers: { Accept: 'application/json' } });
			jokes.push(res.data.joke);
			this.setState({ jokes: jokes });
		}
	}

	render() {
		return (
			<div className="JokeList">
				<ul>
					{this.state.jokes.map((joke) => {
						return <li>{joke}</li>;
					})}
				</ul>
			</div>
		);
	}
}

export default JokeList;
