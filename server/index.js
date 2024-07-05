// Basically importing stuff by requiring it and setting it to a const
const express = require('express');
const cors = require('cors');
const db = require('./llm.js')
const path = require('path')
const { rateLimit } = require('express-rate-limit')

  

// Create the app
const app = express()
app.use(cors())
// The Express JSON middleware parses incoming requests with JSON payloads into `req.body`
app.use(express.json())
// Rate limit
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, //  1 minute
	limit: 1, // Limit each IP to 100 requests per `window` 
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// run the server on whatever was specified by the env or fallback to 3000
const PORT = process.env.PORT || 3000

// Respond to / with Hello, world!
// `=>` is an arrow function, which is shorthand for function (req, res) { ... }
// It indicates that the following body uses the parameters `req` and `res`
// From W3Schools: `hello = (val) => "Hello " + val;`
// app.get('/', (req, res) => {
//     res.send('Hello, world!')
// })
app.use('/getRhyme', limiter)
app.post('/getRhyme', (req, res) => handle(req, res, db.getRhyme))

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

app.use(express.static(path.join(__dirname, '../public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
