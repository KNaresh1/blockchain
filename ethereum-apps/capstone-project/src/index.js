import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'

import App from './components/App';
// import * as serviceWorker from ./serviceWorker.js

ReactDOM.render(<App />, document.querySelector('#root'));

// If you want your app to work offilne and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers. https://bit.ly/CRA-PWA
// serviceWorker.unregister();