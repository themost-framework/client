const minimist = require('minimist');
const { TypeRenderer } = require('../dist');
const { writeFileSync } = require('fs');

async function main() {
    const args = minimist(process.argv.slice(2), {
        alias: {
            outFile: 'out-file'
        },
    });
    if (args.help) {
        console.log('Usage: client-cli [options]');
        console.log('Options:');
        console.log('  --host <host>  The HTTP address of the host api server to connect to');
        console.log('  --out-file <file>  The output file to write the rendered types to');
        return;
    }
    if (!args.host) {
        console.error('Error: Missing required argument --host');
        return process.exit(-1);
    }
    const typeRenderer = new TypeRenderer(args.host);
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
