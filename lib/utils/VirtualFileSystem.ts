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

type TVirtualFileSystemNodeHash = { [name: string]: VirtualFile | VirtualFolder };

interface IVirtualNode {
    parent: VirtualFolder;
}

class VirtualFile implements IFile, IVirtualNode {
    public parent: VirtualFolder;
    constructor(public path: string, public content: string) { }
}

class VirtualFolder implements IFolder, IVirtualNode {

    public parent: VirtualFolder;
    public children: TVirtualFileSystemNodeHash;

    constructor(public path: string, children?: TVirtualFileSystemNodeHash) {
        this.children = children || {};
    }
}

export class VirtualFileSystem implements IFileSystem {

    public root: VirtualFolder = new VirtualFolder("/");

    public async mkdir(path: string, relativeTo?: VirtualFolder): Promise<VirtualFolder> {
        const segments = pathToSegments(path);
        const parentFolder = relativeTo || this.root;
        if (segments.length === 0) {
            return parentFolder;
        } else {
            let child = parentFolder.children[segments[0]];
            if (!child) {
                child = new VirtualFolder(segments[0]);
                child.parent = parentFolder;
                parentFolder.children[segments[0]] = child;
            }
            if (!(child instanceof VirtualFolder)) {
                throw new Error(`Can't create folder ${absolutePath(child)}, file exists under this path`);
            }
            if (segments.length === 1) {
                return child;
            }
            segments.shift();
            return this.mkdir(segments.join("/"), child);
        }
    }

    public async exists(path: string, relativeTo?: VirtualFolder): Promise<boolean> {
        const segments = pathToSegments(path);
        const parentFolder = relativeTo || this.root;
        if (segments.length === 0) {
            return true;
        } else {
            let child = parentFolder.children[segments[0]];
            if (!child) {
                return false;
            }
            if (segments.length === 1) {
                return true;
            }
            if (child instanceof VirtualFolder) {
                segments.shift();
                return this.exists(segments.join("/"), child);
            }
            return false;
        }
    }

    public async isDir(path: string): Promise<boolean> {
        const node = await this.get(path);
        return !!(node && node instanceof VirtualFolder);
    }

    public async isFile(path: string): Promise<boolean> {
        const node = await this.get(path);
        return !!(node && node instanceof VirtualFile);
    }

    public async readAsString(path: string): Promise<string> {
        const node = await this.get(path);
        return node
            ? (node as VirtualFile).content
            : undefined;
    }

    public async writeAsString(path: string, content: string, charset: string): Promise<VirtualFile> {
        const dirPath = Path.dirname(path);
        const basename = Path.basename(path);
        const parent = await this.mkdir(dirPath);
        let current = await this.get(basename, parent);
        if (current) {
            if (current instanceof VirtualFile) {
                current.content = content;
            } else {
                throw new Error(`Can't create file as folder exists in path ${absolutePath(current)}`);
            }

        } else {
            current = new VirtualFile(basename, content);
            current.parent = parent;
            if (parent && parent.children && basename && parent as any !== current as any) {
                try {
                    parent.children[basename] = current;
                } catch(e) {
                    console.error(e);
                }
            }
            
        }
        return current as VirtualFile;
    }

    public async delete(path: string): Promise<boolean> {
        const node = await this.get(path);
        if (node && node.parent) {
            delete node.parent.children[node.path];
            return true;
        }
        return false;
    }

    public async get(path: string, relativeTo?: VirtualFolder): Promise<VirtualFile | VirtualFolder> {
        const segments = pathToSegments(path);
        const parentFolder = relativeTo || this.root;
        if (segments.length === 0) {
            return parentFolder;
        } else {
            let child = parentFolder.children[segments[0]];
            if (segments.length === 1) {
                return child;
            }
            if (child && child instanceof VirtualFolder) {
                segments.shift();
                return this.get(segments.join("/"), child);
            }
            return null;
        }
    }

    public async ls(path: string): Promise<string[]> {
        const folder = await this.get(path);
        if (folder && folder instanceof VirtualFolder && folder.children) {
            return Object.keys(folder.children);
        }
        return [];
    }
}
