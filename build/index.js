import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import meow from 'meow';
import { execa } from 'execa';
import { watch } from 'chokidar';
import { copyDir } from './processors/util.js';
const cli = meow(`
	Usage
	  $ lwc-server [path to lwc directory] <flags>

	Options
	  --default, -d  Default the path so you can pass myComponent instead of force-app/main/default/lwc/myComponent

	Examples
	  $ lwc-server force-app/main/default/lwc/myComponent
	  
	  $ lwc-server myComponent --default
`, {
    importMeta: import.meta,
    flags: {
        default: {
            type: 'boolean',
            shortFlag: 'd',
            default: false,
        }
    }
});
class Paths {
    cwd = process.cwd();
    input = cli.input.at(0) || '';
    lwcDir = cli.flags.default ? `force-app/main/default/lwc/${this.input}` : this.input;
    runDir = dirname(import.meta.url).replace('file://', '');
    lwcCamel = this.lwcDir.split('/').pop() || '';
    lwcKebab = this.lwcCamel.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}
const paths = new Paths();
if (!paths.input) {
    console.error('Please provide a path to the lwc\'s directory');
    process.exit(1);
}
await initialize(paths);
// todo 
/*
if not initialized, initialize
    -	npm i command in the lwr-project

copy the lwc to the lwr-project

npm start in the lwr-project

*/
async function initialize(paths) {
    console.log('paths: ', paths);
    // npm i command in the lwr-project
    log('Initializing lwr-project...');
    const lwrInstall = execa('npm', ['i'], {
        cwd: join(paths.runDir, 'lwr-project'),
    });
    if (lwrInstall?.stdout) {
        lwrInstall.stdout.pipe(process.stdout);
        lwrInstall.stdout.on('finish', secondStep);
    }
    async function secondStep() {
        log('Initialized lwr', true);
        log('Copying files...');
        await copyDir(join(paths.runDir, 'lwr-project', 'node_modules', '@salesforce-ux', 'design-system/assets'), join(paths.runDir, 'lwr-project', 'src', 'assets'));
        log('Copied SLDS', true);
        // copy the lwc to the lwr-project
        await copyDir(join(paths.lwcDir), join(paths.runDir, 'lwr-project', 'src', 'modules', 'base', paths.lwcCamel));
        log('Copied LWC', true);
        // read build/lwr-project/src/modules/base/app/app.html
        const appHtml = await fs.readFile(join(paths.runDir, 'lwr-project', 'src', 'modules', 'base', 'app', 'app.html'), 'utf8');
        // remove anything between <!-- lwc-server start --> and <!-- lwc-server end -->
        // put `<base-${paths.lwcKebab}></base-${paths.lwcKebab}>` between <!-- lwc-server start --> and <!-- lwc-server end -->
        const newAppHtml = appHtml.replace(/<!-- lwc-server start -->[\s\S]*<!-- lwc-server end -->/, `<!-- lwc-server start --><base-${paths.lwcKebab}></base-${paths.lwcKebab}><!-- lwc-server end -->`);
        // write the file back
        await fs.writeFile(join(paths.runDir, 'lwr-project', 'src', 'modules', 'base', 'app', 'app.html'), newAppHtml);
        // npm start in the lwr-project
        log('Starting server...');
        let lwrStart = execa('npm', ['run', 'dev'], {
            cwd: join(paths.runDir, 'lwr-project'),
        });
        if (lwrStart?.stdout) {
            lwrStart.stdout.pipe(process.stdout);
        }
        if (lwrStart?.stderr) {
            lwrStart.stderr.pipe(process.stderr);
        }
        // watch the lwc for changes
        const watcher = watch(paths.lwcDir, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });
        watcher.on('change', async (path) => {
            log(`File ${path} has been changed`);
            log('Syncing...');
            await copyDir(join(paths.lwcDir), join(paths.runDir, 'lwr-project', 'src', 'modules', 'base', paths.lwcCamel));
            log('Synced', true);
        });
    }
    // copy the lwc to the lwr-project
    // npm start in the lwr-project
}
function log(message, allGood = undefined) {
    if (allGood === true)
        return console.log('✅ ', message);
    if (allGood === false)
        return console.log('❌ ', message);
    console.log('🆒 ', message);
}
/* async function stepThree(){
    //const {stdout} = await execa('echo', ['unicorns']);
    //console.log(stdout);
    // @salesforce/apex/

    const pathRoot = `/home/jamie/repo/jdevorg`;

    const pathSrc = `${pathRoot}/force-app/main/default`;
    const pathSrcLwc = `${pathSrc}/lwc`;

    const lwcsDirty: string[] = await fs.readdir(pathSrcLwc)

    const pathRootLwcContents: string[] = lwcsDirty.filter((lwc) => !lwc.startsWith('.'));
    console.log('PathRootLwcContents: ', pathRootLwcContents);

    //const lwcFiles: string[] = await processFileLwc(`${pathSrcLwc}/${pathRootLwcContents[0]}`);

    const results = {}

    async function processFileLwc(pathDirLwc: string): Promise<void> {
        const allFiles: string[] = await fs.readdir(pathDirLwc);
        console.log('lwc files: ', allFiles);
        const htmlFiles: string[] = allFiles.filter((file) => file.endsWith('.html'));
        processFileLwcHtml(pathSrc, pathDirLwc, htmlFiles, r: any => finish('html', r));
        const jsFiles: string[] = allFiles.filter((file) => file.endsWith('.js'));
    }

    function finish(key: string, result: any) {
        //results[key] = result;
        console.log('results: ', results);
    }

} */ 
