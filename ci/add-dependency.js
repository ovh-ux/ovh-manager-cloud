// This tool is used by our CI to add new dependencies dynamically

const fs = require("fs");
const path = require("path");
const dependencies = require("../dependencies.json");

function getArgumentsDependencies(node, script, ...dependencies) {
    return dependencies;
}

const newDependencies = getArgumentsDependencies(...process.argv);

const newJson = Object.assign({}, dependencies, {
    js: [
        ...dependencies.js,
        ...newDependencies
    ]
});

fs.writeFileSync(path.join(__dirname, "../dependencies.json"), JSON.stringify(newJson, null, 4));
