#Dependencies
* [Yeoman](http://yeoman.io) Needed for testing, building, etc
* ```npm install``` Installs server dependencies
* ```bower install``` Installs client dependencies

#Running
### Client
```yeoman server```

The client page will generate a new local players (up to 2) and allow them to be controlled via keyboard.

### Server
```foreman start```

The server is responsible for managing the pickups. Eventually will do game management such as determining the game is over and generating a new stage.
