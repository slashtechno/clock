// Basically importing stuff by requiring it and setting it to a const
const express = require('express');
const cors = require('cors');

// Create the app
const app = express()
app.use(cors())

// run the server on whatever was specified by the env or fallback to 3000
const PORT = process.env.PORT || 3000

// Respond to / with Hello, world!
// `=>` is an arrow function, which is shorthand for function (req, res) { ... }
// It indicates that the following body uses the parameters `req` and `res`
// From W3Schools: `hello = (val) => "Hello " + val;`
app.get('/', (req, res) => {
    res.send('Hello, world!')
})

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
