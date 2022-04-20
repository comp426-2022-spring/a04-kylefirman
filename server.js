//irequire express and then minimist splicing
const express = require('express');
const res = require('express/lib/response');
const app = express()

const args = require('minimist')(process.argv.slice(2))
args["port"]
const port = args.port || process.env.PORT || 5000;

const db = require('./database.js')
const morgan = require('morgan')
const fs = require('fs')

if (arguments.log != false) {
  // Use morgan for logging to files
  // Create a write stream to append (flags: 'a') to a file
  const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' })
  // Set up the access logging middleware
  app.use(morgan('combined', { stream: WRITESTREAM }))
}

//not sure about this being the spot but i think this is for the args
const help = (`
server.js [options]
--port  Set the port number for the server to lister on. Must be an interger
            between 1 and 65535.
--debug If set to true, creates endpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error/ which throws
            an error with the message "Error test successful." Defaults to
            false.
--log           If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help  Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
  console.log(help)
  process.exit(0)
}

app.use( (req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next()
})

if (args.debug == true) {
  app.get('/app/log/access', (req, res, next) => {
    try {
      const stmt = db.prepare('SELECT * FROM accesslog').all()
      res.status(200).json(stmt)
  } catch {
      console.error('Error')
  }})
  app.get('/app/error/', (req, res, next) => {
    throw new Error('Error test successful')
  })
}

//a03 endpoints
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', port))
});

app.get('/app/', (req, res) => {
      res.statusCode = 200;
      res.end(res.statusCode + "OK");
});


//Coin Functions because importing them wouldnt work 
function coinFlip() {
  let flipped = Math.floor(Math.random() * 2)
  if (flipped == 0) {
    return "heads";
  } else {
    return "tails";
  }
}
  
function coinFlips(flips) {
  let results = [flips];
  for (let i = 0; i < flips; i++) {
    results[i] = coinFlip();
  }
  return results;
}
  
function countFlips(array) {
  let headcount = 0;
  let tailscount = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] == "heads") {
      headcount++;
    } else {
      tailscount++;
    }
  }
  return {"heads": headcount, "tails": tailscount};
}
  
function flipACoin(call) {
  var flip = coinFlip()
  if (call == flip) {
    var result = "win"
  } else {
    var result = "lose"
  }
  return {"call": call, "flip": flip, "result": result};
}


//rest of API endpoints
app.get('/app/flip/', (req, res) => {
  const flip = coinFlip()
	res.status(200).json({"flip" : flip})
});

app.get('/app/flips/:number', (req, res) => {
  const flips = coinFlips(req.params.number)
  res.status(200).json({"raw" : flips, "summary" : countFlips(flips)})
});

app.get('/app/flip/call/tails', (req, res) => {
  res.statusCode = 200
  res.json(flipACoin("tails"))
});

app.get('/app/flip/call/heads', (req, res) => {
  res.statusCode = 200
  res.json(flipACoin("heads"))
});

app.use(function(req, res){
  res.status(404).send("404 NOT FOUND")
});