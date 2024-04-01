#!/usr/bin/env node
const minimist = require('minimist');
const { TypeRenderer, FileSchemaRenderer } = require('../dist');
const { writeFileSync } = require('fs');

async function main() {
    const args = minimist(process.argv.slice(2), {
        alias: {
            outFile: 'out-file'
        },
    });
    if (args.help) {
        console.log('Usage: client-cli <source> [options]');
        console.log('Options:');
        console.log('  --out-file <output>  The output file to write the rendered types to');
        return;
    }
    const source = args._[0];
    if (!source) {
        console.error('Missing argument: A source metadata file or a valid URL must be provided');
        return process.exit(-1);
    }
    const isURL = source.startsWith('http://') || source.startsWith('https://');
    const typeRenderer = isURL ? new TypeRenderer(source) : new FileSchemaRenderer(source);
    const result = await typeRenderer.renderAny();
    if (args.outFile) {
        writeFileSync(args.outFile, result);
    } else {
        process.stdout.write(result);
        process.stdout.write('\n');
    }
}

main().then(() => {
    return process.exit(0);
}).catch((err) => {
    console.error(err.message);
    console.error(err.stack);
    return process.exit(-1);
});
