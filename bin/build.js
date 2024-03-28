// a very simple node concatination script that takes a directory of js files and concats them into a single file,
// this file is exported to build as `ai2html.js``

const fs = require('fs');
const path = require('path');

const ai2htmlDir = path.join(__dirname, '../src');
const ai2htmlFiles = fs.readdirSync(ai2htmlDir).filter(f => f.endsWith('.js'));
const ai2html = ai2htmlFiles.map(f => fs.readFileSync(path.join(ai2htmlDir, f), 'utf8')).join('\n');

const buildDir = path.join(__dirname, '../build');
const buildFile = path.join(buildDir, 'ai2html.js');

if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

fs.writeFileSync(buildFile, ai2html);

console.log(`Concatenation completed. Output file: ${buildFile}`);

// copying file to scripts dir for testing

const ai2jsonDir = '/Applications/Adobe Illustrator 2024/Presets.localized/en_US/Scripts';
const ai2jsonFile = path.join(ai2jsonDir, 'ai2json.js');

if (!fs.existsSync(ai2jsonDir)) {
    console.error(`Directory not found: ${ai2jsonDir}`);
    process.exit(1);
}

fs.copyFileSync(buildFile, ai2jsonFile);

console.log(`Copied to ${ai2jsonFile}`);

// Path: bin/build.js

