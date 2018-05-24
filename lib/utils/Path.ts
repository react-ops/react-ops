import {
    IFileSystemNode
} from "../index.d";

export const pathToSegments = (path: string) => 
    path && path.replace
        ? path.replace(/^\//, '').split("/").filter(a => a !== "" && a !== null)
        : []

export const absolutePath = (node: IFileSystemNode) =>
    node ?
        (node.parent
            ? absolutePath(node.parent) + "/" + node.path
            : "/" + node.path)
        : null
