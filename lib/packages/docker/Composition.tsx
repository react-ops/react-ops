import * as React from "react";
import { File, ReactOpsComponent } from "../../primitives";

export class Composition extends File {

    constructor(props) {
        super(props);
        this.setState({ content: "abc" });
    }

    public render() {
        return super.render();
    }

}
