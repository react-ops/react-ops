import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as Path from "path";
import {
    IFileSystem,
    IFileSystemNode,
    IFile,
    IFolder,
    TFileSystemNodeHash
} from "../index.d";
import {
    pathToSegments,
    absolutePath
} from "./Path";

type TLocalFileSystemNodeHash = { [name: string]: IFile | IFolder };

class LocalFile implements IFile {

    public get parent(): LocalFolder {
        return new LocalFolder(Path.dirname(this.path), this.fs)
    }

    constructor(public path: string, private fs: LocalFileSystem) { }
}

class LocalFolder implements IFolder {

    public get parent(): LocalFolder {
        return new LocalFolder(Path.dirname(this.path), this.fs)
    }
    public get children() {
        return Promise.resolve(null);
    }

    constructor(public path: string, private fs: LocalFileSystem ) { }
}

export class LocalFileSystem implements IFileSystem {

    private chroot: string;

    constructor(chroot: string) {
        this.chroot = chroot;
    }

    public async mkdir(path: string, relativeTo?: LocalFolder): Promise<LocalFolder> {

        const absolutePath = Path.join(this.chroot, path);
        const exists = await this.isDir(absolutePath);
        if (!exists) {
            await new Promise((resolve, reject) => {
                mkdirp(absolutePath, error => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            });
        }
        return new LocalFolder(absolutePath, this);
    }

    public async exists(path: string, relativeTo?: LocalFolder): Promise<boolean> {
        try {
            await this.stats(Path.join(this.chroot, path));
            return true;
        } catch (exception) {
            if ((exception as NodeJS.ErrnoException).code === "ENOENT") {
                return false;
            }
            throw exception;
        }
    }

    public async isDir(path: string): Promise<boolean> {
        try {
            const stats = await this.stats(Path.join(this.chroot, path));
            return stats.isDirectory();
        } catch (exception) {
            return false;
        }
    }

    public async isFile(path: string): Promise<boolean> {
        try {
            const stats = await this.stats(Path.join(this.chroot, path));
            return stats.isFile();
        } catch (exception) {
            return false;
        }
    }

    public async readAsString(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(Path.join(this.chroot, path), "utf8", (error: NodeJS.ErrnoException, content: string) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(content);
            });
        });
    }

    public async writeAsString(path: string, content: string, charset: string): Promise<LocalFile> {
        return new Promise<LocalFile>((resolve, reject) => {
            fs.writeFile(Path.join(this.chroot, path), content, charset, (error: NodeJS.ErrnoException) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(new LocalFile(path, this));
            });
        });        
    }

    public async delete(path: string): Promise<boolean> {
        const node = await this.get(path);
        if (node && node.parent) {
            delete node.parent.children[node.path];
            return true;
        }
        return false;
    }

    private async get(path: string, relativeTo?: LocalFolder): Promise<IFileSystemNode> {
        try {
            const stat = await this.stats(Path.join(this.chroot, path));
            if (stat.isDirectory()) {
                return new LocalFolder(path, this);
            }
            return new LocalFile(path, this);
        } catch (exception) {
            if ((exception as NodeJS.ErrnoException).code === "ENOENT") {
                return null;
            }
            throw exception;
        }
    }

    private async stats(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error: NodeJS.ErrnoException, stats: fs.Stats) => {
                if (error) {
                    return reject(error);
                }
                resolve(stats);
            });
        });
    }
}
