import * as React from "react";
import {
    ReactOpsComponent,
} from "./Component";
import {
    IReactOpsNode
} from "../index.d"

export interface IFileProps {
    name: string
}

export class File extends ReactOpsComponent<IFileProps, IFileProps> {

    

    public render(): IReactOpsNode {
        return {
            type: "file",
            key: this.props.name,
            props: {
                ...this.props
            }
        };
    }
}
