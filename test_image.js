const fs = require('fs');
const buf = fs.readFileSync('/Users/nanditkalaria/Downloads/project/client/src/assets/raju.png');
// roughly check if the first pixel is green
// we need a library for this, but since we don't have one, let's just assume the user means "remove the green background".
