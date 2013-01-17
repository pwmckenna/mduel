#[Play the game!](pwmckenna.github.com/mduel)


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

#Deployement

All commits to the master branch trigger a ```yeoman test build``` on [travis-ci](https://travis-ci.org/pwmckenna/mduel), and if everything looks good, the dist folder is pushed directly to gh-pages and is live within minutes.

[![Build Status](https://travis-ci.org/pwmckenna/mduel.png?branch=master)](undefined)

Pushes of the server are still being worked out. Currently hosted on ec2, but it would awesome to use something that travis-ci could deploy to.
