import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as Path from "path";
import * as rimraf from "rimraf";
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

    constructor(public path: string, private fs: LocalFileSystem) { }
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
            if (["ENOENT", "ENOTDIR"].indexOf((exception as NodeJS.ErrnoException).code) !== -1) {
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
                    if (["EISDIR", "ENOENT", "ENOTDIR"].indexOf(error.code) !== -1) {
                        resolve(undefined);
                        return;
                    }
                    reject(error);
                    return;
                }
                resolve(content);
            });
        });
    }

    public async writeAsString(path: string, content: string, charset: string): Promise<LocalFile> {
        const directory = Path.dirname(path);
        await this.mkdir(directory);
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
        if (!await this.exists(path)) {
            return false;
        }
        return new Promise<boolean>((resolve, reject) => {
            rimraf(Path.join(this.chroot, path), error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(true);
            })
        });
    }

    public async get(path: string, relativeTo?: LocalFolder): Promise<IFileSystemNode> {
        try {
            const stat = await this.stats(Path.join(this.chroot, path));
            if (stat.isDirectory()) {
                return new LocalFolder(path, this);
            }
            return new LocalFile(path, this);
        } catch (exception) {
            if (["ENOENT", "ENOTDIR"].indexOf((exception as NodeJS.ErrnoException).code) !== -1) {
                return null;
            }
            throw exception;
        }
    }

    public async ls(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) =>
            fs.readdir(Path.join(this.chroot, path), (err: NodeJS.ErrnoException, files: string[]) =>
                err
                    ? (
                        ["ENOENT", "ENOTDIR"].indexOf(err.code) !== -1
                            ? resolve([])
                            : reject(err)
                    )
                    : resolve(files)
            ));
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
