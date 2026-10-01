const JSCPP = require('JSCPP');

const invalidCode = `
#include <stdio.h>

int main() {
    int a = 5
    return 0;
}
`;

try {
    JSCPP.run(invalidCode, '', {});
} catch (err) {
    console.log('Caught Error Successfully:');
    console.log(err.message || err);
}
