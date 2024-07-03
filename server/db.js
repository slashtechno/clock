// Import the file system module with promises
// Many core modules in Node.js have a `.promises` property that allows for async
const fs = require('fs').promises;

const STORE = "./store.json"

// Export the functions so they can be used in other files
module.exports = {
    getAll
}

// An underscore before a parameter name is a convention to indicate that the parameter is not used
async function getAll(_req) {
    const data = await fs.readFile(STORE)

    // Convert the buffer to a string
    return data.toString()
}