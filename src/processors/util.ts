import { promises as fs } from 'fs';
import { join } from 'path';

export async function copyDir(src: string, dest: string) {
    await fs.mkdir(dest, { recursive: true });

    let entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = join(src, entry.name);
        let destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFile(srcPath, destPath);
        }
    }
}