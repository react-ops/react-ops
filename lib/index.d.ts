import * as React from "react";

declare module "react" {
    namespace React { }
}

export interface IFileSystemNode {
    path: string;
    parent: IFolder;
}

export interface IFile extends IFileSystemNode {

}

export type TFileSystemNodeHash = { [name: string]: IFileSystemNode };

export interface IFolder extends IFileSystemNode {
    children: TFileSystemNodeHash | PromiseLike<TFileSystemNodeHash>
}




export interface IFileSystem {
    mkdir(path: string): Promise<IFolder>
    exists(path: string): Promise<boolean>
    isDir(path: string): Promise<boolean>
    isFile(path: string): Promise<boolean>
    readAsString(path: string): Promise<string>
    writeAsString(path: string, content: string, charset: string): Promise<IFile>
    delete(path: string): Promise<boolean>
}

export interface IReactOpsProps {
    $fs?: IFileSystem;
    $chroot?: string;
}
export interface IReactOpsElement extends React.ReactElement<IReactOpsProps> { }
export interface IReactOpsNode extends React.ReactElement<IReactOpsElement> {
    diff(): any;
    apply(): any;
}

export type TReactOpsProps = Readonly<IReactOpsProps> & Readonly<{ children?: React.ReactNode }>;

type TReactOpsStatelessComponent = React.StatelessComponent<TReactOpsProps>
type TReactOpsComponentClass = React.ComponentClass<TReactOpsProps>
type TReactOpsElement = TReactOpsStatelessComponent | TReactOpsComponentClass
type TReactOpsNode = React.ReactNode;
