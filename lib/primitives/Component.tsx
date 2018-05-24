import * as React from "react";
import {
    TReactOpsProps
} from "../index.d";

export class ReactOpsComponent<P = {}, S = {}> extends React.Component<P & TReactOpsProps, S, {}> {
    constructor(props: P) {
        super(props);
    }
}
