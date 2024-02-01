import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { copyDir } from './util.js';
export async function processFileLwcHtml(pathSrc, pathLwc, htmlFiles, cb) {
    const htmlFile = htmlFiles[2];
    const fileStream = createReadStream(`${pathLwc}/${htmlFile}`);
    fileStream
        .on("data", (data) => {
        data.toString().split('\n').forEach((htmlString) => {
            // regex to find custom elements
            processHtmlString(pathSrc, pathLwc, htmlString, cb);
        });
    })
        .on("end", () => {
        //console.log("No more data."); 
    });
}
async function processHtmlString(pathSrc, pathLwc, htmlString, cb) {
    const uniqueLwcNames = getUniqueLwcNames(htmlString);
    const areLocal = await checkCustomElementsAreLocal(pathSrc, pathLwc, uniqueLwcNames);
    if (areLocal) {
        await copyDir(join(pathSrc, 'lwc'), join('..', 'lwr-project', 'src', 'modules', 'base'));
    }
    cb({
        success: areLocal,
    });
}
async function checkCustomElementsAreLocal(pathSrc, pathLwc, elNames) {
    const nonLocal = [];
    for (const elName of elNames) {
        console.log('elName: ', elName);
        const camelCase = elName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const path = `${pathSrc}/lwc/${camelCase}/${camelCase}.js`;
        console.log();
        const exists = await fileExists(path);
        if (!exists) {
            nonLocal.push(elName);
        }
    }
    if (nonLocal.length > 0) {
        console.warn(`Custom elements are not local: ${nonLocal.join(', ')}`);
    }
    return nonLocal.length === 0;
}
function getUniqueLwcNames(htmlString) {
    const elNames = getElNames(htmlString);
    const uniqueLwcNames = [...new Set(elNames)]
        .filter((elName) => elName.includes('-'))
        .filter((elName) => !elName.startsWith('lightning-'))
        .map((elName) => elName.replace(/c-/g, ''));
    return uniqueLwcNames;
}
function getElNames(htmlString) {
    const regex = /<([a-z0-9-]+).*?/g;
    let match, elNames = [];
    while ((match = regex.exec(htmlString)) !== null) {
        if (match[1]?.includes('-')) {
            elNames = [...elNames, match[1].replace(/</g, '')];
        }
    }
    return elNames;
}
async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    }
    catch {
        return false;
    }
}
