import * as React from "react";
import {
    ReactOpsComponent
} from "./Component";

export interface IFileProps {
    name: string;
    content?: Buffer | string;
}

export class File extends ReactOpsComponent<IFileProps, IFileProps> {
    public render() {
        return {
            name: this.state.name,
            content: this.state.content
        };
    }
}
