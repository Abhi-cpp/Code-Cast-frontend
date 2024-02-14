// read inputs from inputs.txt

const fs = require('fs');
const content = fs.readFileSync('inputs.txt', 'utf8');
const inputs = content.split('\n');
const ids = [];

for (let i = 0; i < inputs.length; i++) {
    const id = parseInt(inputs[i].split(' ')[1]);
    ids.push(id);
}

// sort ids
// sort on numberic basis
ids.sort((a, b) => a - b);

// write ids in idx.txt
fs.writeFileSync('idx.txt', ids.join('\n'), 'utf8');

