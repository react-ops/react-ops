import { Observable } from "rxjs";
import { ReactNode } from "react";

export = React;
export as namespace React;

declare namespace React {
    class Component<P, S> {
        render(...args): ReactNode | PromiseLike<ReactNode> | Observable<ReactNode>
    }
}

