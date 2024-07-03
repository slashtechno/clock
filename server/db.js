// Import the file system module with promises
// Many core modules in Node.js have a `.promises` property that allows for async
const fs = require('fs').promises;

const STORE = "./store.json"

// Export the functions so they can be used in other files
module.exports = {
    getAll,
    set,
    clearDb
}

// An underscore before a parameter name is a convention to indicate that the parameter is not used
async function getAll(_req) {
    const data = await fs.readFile(STORE)

    // Convert the buffer to a string
    return data.toString()
}

async function set(req) {
    // set key and value
    const {
        key, value
    } = req.body

    // Read file
    const file = await fs.readFile(STORE)
    // Serialize the data
    // JSON.parse can handle a buffer
    const object = JSON.parse(file);
    // Merge the objects
    const mergedObject = {
        // Spread operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        ...object,
        // Without square brackets, the key would be the string "key"
        [key]: value
    }

    await fs.writeFile(STORE, JSON.stringify(mergedObject))
    // Assuming the write was successful, return the set object
    return {
        [key]: value
    }

}

async function clearDb(req){
    await fs.writeFile(STORE, JSON.stringify({}));
    const contents = await fs.readFile(STORE);
    return contents.toString();
}