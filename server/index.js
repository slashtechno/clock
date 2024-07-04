// Basically importing stuff by requiring it and setting it to a const
const express = require('express');
const cors = require('cors');
const db = require('./db')
const { rateLimit } = require('express-rate-limit')

  

// Create the app
const app = express()
app.use(cors())
// The Express JSON middleware parses incoming requests with JSON payloads into `req.body`
app.use(express.json())
// Rate limit
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, //  1 5minute
	limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
app.use(limiter)

// run the server on whatever was specified by the env or fallback to 3000
const PORT = process.env.PORT || 3000

// Respond to / with Hello, world!
// `=>` is an arrow function, which is shorthand for function (req, res) { ... }
// It indicates that the following body uses the parameters `req` and `res`
// From W3Schools: `hello = (val) => "Hello " + val;`
// app.get('/', (req, res) => {
//     res.send('Hello, world!')
// })
app.get('/getAll', (req, res) => handle(req, res, db.getAll))
app.post('/set', (req, res) => handle(req, res, db.set))
app.post('/clearDb', (req, res) => handle(req, res, db.clearDb))


async function handle(req, res, method){
  // Log the request 
  console.log("Received request")
  // Try to call the method on the request
  try{
    const onSuccess = await method(req);
    // If this fails, the following won't run
    res.send({
      status: "success",
      response: onSuccess
    })
  } catch(e){
    res.send({
      status: "failure",
      error: e.message
    })
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
