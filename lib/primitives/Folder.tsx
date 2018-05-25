import * as React from "react";
import * as path from "path";
import {
    ReactOpsComponent,
} from "./Component";
import {
    IReactOpsNode
} from "../index.d"
import {
    IFileProps
} from "./File";

export class Folder extends ReactOpsComponent<IFileProps, IFileProps> {
    public render(): IReactOpsNode {
        return {
            type: "folder",
            key: this.props.name,
            props: {
                children: [],
                ...this.props,                
                $chroot: path.join(this.props.$chroot, this.props.name)
            }
        };
    }
}
