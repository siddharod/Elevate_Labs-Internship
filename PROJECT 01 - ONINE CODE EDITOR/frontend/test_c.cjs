const JSCPP = require('JSCPP');

const code = `
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}
`;

let output = '';
try {
    const exitCode = JSCPP.run(code, '5 10', {
        stdio: {
            write: (s) => { output += s; }
        }
    });
    console.log('SUCCESS! ExitCode:', exitCode, 'Output:', output);
} catch (err) {
    console.error('ERROR:', err);
}
