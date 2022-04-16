import * as App from "./App.js";
import * as Assets from "./Assets.js";

Assets.load()
	.then(App.initialize)
	.catch((e) => console.error(e));
