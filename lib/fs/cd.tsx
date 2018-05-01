
import * as React from "react";
import { ReactOps, IReactOpsProps, ReactOpsComponent } from "../react.ops";
import * as path from "path";
/**
 * Ensures folder exists
 */
export class Cd extends ReactOpsComponent<{
    path: string;
}> {

    getChildContext() {
        console.log("context");
        return { ...this.props, _base: path.join(this.props._base, this.props.path) }
    }


    async render() {
        this.props.reporter("cd " + path.join(this.props._base, this.props.path));
        return this.props.children;
    }
}

