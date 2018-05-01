import * as React from "react";
import { Observable } from "rxjs";
import * as debug from "debug";
import * as fs from "fs";

export type TReactOpsStatus = "error" | "success" | "pending" | "idle";

declare module "react" {
    namespace React {

    }
}

export interface IFS {
    stat: (path: fs.PathLike, callback: (err: NodeJS.ErrnoException, stats: fs.Stats) => void) => void;
    mkdir: (path: fs.PathLike, mode: number | string | undefined | null, callback: (err: NodeJS.ErrnoException) => void) => void;
}

export interface IReactOpsProps {
    reporter?: (message: string) => any;
    children?: JSX.Element;
    _base?: string;
    _fs?: IFS;
    _dry?: boolean;
}

export interface IReactOpsElement extends React.ReactElement<IReactOpsProps> {
    execute?: () => Observable<TReactOpsStatus>,
}

export class ReactOpsComponent<T> extends React.Component<T & IReactOpsProps, {}, {}> {
}

function shouldConstruct(Component) {
    return Component.prototype && Component.prototype.isReactComponent;
}

type TReactOpsPureFunction = (props) => IReactOpsElement;
type TReactOpsComponentConstructor = (props) => void;
type TReactOpsElement = TReactOpsPureFunction | ReactOpsComponent<any>;

export const ReactOps = {



    render: async <T extends IReactOpsElement>(
        element: T | PromiseLike<T>,
        executionPath: string | null,
        callback?: () => void
    ): Promise<void> => {
        let cast: T;

        if ((element as PromiseLike<T>).then) {
            try {
                cast = await element;
            } catch (exception) {
                console.error(exception);
                return null;
            }
        } else {
            cast = element as T;
        }

        const ElementType = (cast.type as TReactOpsElement);
        const reporter = debug("react-ops:" + (cast.type as any).name);
        const props: IReactOpsProps = { ...cast.props, reporter, _base: executionPath, _fs: fs };
        let content;
        if (shouldConstruct(ElementType)) {
            const instance = new (ElementType as TReactOpsComponentConstructor)(props);
            content = instance.render();
        } else {
            content = (ElementType as TReactOpsPureFunction)(props);;
        }

        if (content.then) {
            content = await content;
        }

        if (content && content.type) {
            return ReactOps.render(content, executionPath, callback);
        }
        if (callback) {
            callback();
        }
    }

}
