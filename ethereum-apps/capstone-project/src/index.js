import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App'
import configureStore from './store/configureStore'

// import * as serviceWorker from ./serviceWorker.js

import 'bootstrap/dist/css/bootstrap.css'

ReactDOM.render(
	<Provider store = {configureStore()}>
		<App />
	</Provider>,
	document.querySelector('#root')
);

// If you want your app to work offilne and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers. https://bit.ly/CRA-PWA
// serviceWorker.unregister();