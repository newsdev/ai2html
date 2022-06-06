// This runs an AppleScript file that tells Illustrator to run ai2html

const { spawn } = require("child_process");
const path = require("path");

// const file_name = process.argv[2];
const file_name = `sample files/sample-ai-file.ai`;

const file_path = path.resolve(file_name);

console.log(`Running ai2html on: ${file_name}`, file_path);

const ai2html_path = path.resolve(`./ai2html.js`);

// Run applescript
const applescript = `
tell application "Adobe Illustrator" to activate
tell application "Adobe Illustrator" to open "${file_path}"
tell application "Adobe Illustrator" to do javascript "// @include ${ai2html_path}"
`;
const spawned = spawn(`osascript`, [`-`], { cwd: process.cwd() });
spawned.stdin.write(applescript);
spawned.stdin.end();

spawned.on("close", () => {
  console.log(`Done`);
});
