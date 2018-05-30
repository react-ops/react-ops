import * as React from "react";
import {
    IReactOpsElement,
    IReactOpsNode,
    IReactOpsProps,
    TReactOpsComponentClass,
    TReactOpsElement,
    TReactOpsNode,
    TReactOpsProps,
    TReactOpsStatelessComponent,
    IFileSystem,
} from "./index.d";
import {
    LocalFileSystem
} from "./utils";
import * as Path from "path";
import { DiffPatcher, formatters } from "jsondiffpatch";

declare module "jsondiffpatch" {
    const formatters: any;
}

const shouldConstruct = (Component) => Component.prototype && Component.prototype.isReactComponent;

export class ReactOps {

    public static async diff<T extends IReactOpsElement>(
        element: T,
        executionPath: string | null,
        inputProps?: TReactOpsProps,
        visual: boolean = false
    ): Promise<any> {
        const { virtualDom, fs } = await ReactOps.virtualDomAndFS(element, executionPath, inputProps);
        const state = await ReactOps.collect(executionPath, fs);
        const differ = new DiffPatcher();
        const cleanDOM = ReactOps.cleanup(virtualDom);
        const diff = differ.diff(cleanDOM, state);

        if (visual) {
            const formatter = new formatters.console.default();
            return formatter.format(diff, cleanDOM);
        }

        return diff;
    }

    public static async apply<T extends IReactOpsElement>(
        element: T,
        executionPath: string | null,
        inputProps?: TReactOpsProps
    ): Promise<any> {
        const virtualDom = await ReactOps.render(element, executionPath, inputProps);
        return await ReactOps.applyFileSystem(virtualDom);
    }

    public static cleanup(node: TReactOpsNode): TReactOpsNode {
        if (!node || typeof node !== "object") {
            return node;
        }
        const element = node as IReactOpsElement;
        const { children, $fs, $chroot, $dry, ...props } = element.props || {
            children: undefined,
            $fs: undefined,
            $chroot: undefined,
            $dry: undefined
        }

        return {
            type: element.type,
            key: element.key,
            props: {
                ...props,
                children: Array.isArray(children)
                    ? children.map(ReactOps.cleanup)
                    : children
            }
        }
    }

    public static async collect(
        path: string,
        fs: IFileSystem
    ): Promise<TReactOpsNode> {

        const isDir = await fs.isDir(path);
        const name = Path.basename(path);

        if (isDir) {

            const items = (await fs.ls(path)).filter(s => s !== "." && s !== "..")

            const children = await Promise
                .all(items
                    .map(child => ReactOps
                        .collect(Path.join(path, child), fs)))

            return {
                type: "folder",
                key: name,
                props: {
                    name,
                    children
                }
            }
        }

        return {
            type: "file",
            key: name,
            props: {
                name,
                children: [await fs.readAsString(path)]
            }
        }

    }

    /**
     * 
     * @param element 
     * @param executionPath 
     * @param inputProps 
     */
    public static async render<T extends IReactOpsElement>(
        element: T,
        executionPath: string | null,
        inputProps?: TReactOpsProps
    ): Promise<TReactOpsNode> {
        if (!element) {
            return null;
        }

        let { $fs, $chroot, $dry } = inputProps || { $fs: null, $chroot: null, $dry: false };
        $fs = $fs || new LocalFileSystem(executionPath);
        $chroot = $chroot || executionPath;

        let parentProps: TReactOpsProps = { // should be HOC?
            $fs,
            $chroot,
            $dry
        }

        let content: TReactOpsNode = await ReactOps.invokeRender(element, parentProps, executionPath);
        const asElement = content as React.ReactElement<TReactOpsProps>;

        // content = ReactOps.flat(content as React.ReactElement<TReactOpsProps>);

        return content;
    }


    private static async virtualDomAndFS<T extends IReactOpsElement>(
        element: T,
        executionPath: string | null,
        inputProps?: TReactOpsProps
    ) {
        const virtualDom = await ReactOps.render(element, executionPath, inputProps);
        const fs = virtualDom
            ? (virtualDom as IReactOpsElement).props.$fs
            : (inputProps
                ? inputProps.$fs
                : null
            )
        if (!fs) {
            throw new Error("No file system");
        }
        return { virtualDom, fs };
    }

    private static children(props: TReactOpsProps): null | React.ReactNode[] {
        if (props && props.children) {
            if (Array.isArray(props.children)) {
                return props.children;
            }
            return [props.children];
        }
        return null;
    }

    private static async renderChildren(childrenSpec: React.ReactNode[], props: TReactOpsProps, executionPath: string | null) {
        let childNodes;

        const { children, ...parentProps } = props || { children: null };
        childNodes = await Promise
            .all(childrenSpec.map(child =>
                ReactOps.renderChild(child, executionPath, parentProps)
            ));
        return {
            children: childNodes
        }
    }

    private static async invokeRender(element: IReactOpsElement, inputProps: TReactOpsProps, executionPath: string): Promise<TReactOpsNode> {

        if (typeof element.type !== "string") {

            const ElementType = element.type as TReactOpsElement;
            let props = { ...inputProps, ...element.props };
            let renderMethod;
            let childProps = props;

            if (shouldConstruct(ElementType)) {
                const instance = new (ElementType as TReactOpsComponentClass)(props);
                const asContext = (instance as any) as React.ChildContextProvider<any>;

                if (asContext.getChildContext) {
                    childProps = {
                        ...props,
                        ...asContext.getChildContext()
                    }
                }
                renderMethod = (props) => {
                    instance.props = props;
                    return instance.render();
                }
            } else {
                renderMethod = (ElementType as TReactOpsStatelessComponent)
            }

            const children = ReactOps.children(props);

            if (children && children.length) {
                props = {
                    ...props,
                    ...(await ReactOps.renderChildren(children, childProps, executionPath))
                }
            }

            return renderMethod(props);
        } else {
            return element;
        }
    }

    /**
     * 
     * @param child 
     * @param executionPath 
     * @param props 
     */
    private static async renderChild(child: any, executionPath: string | null, props: TReactOpsProps): Promise<TReactOpsNode> {

        const type = typeof child;

        if (["string", "number", "boolean"].indexOf(type) !== -1) {
            return child;
        }

        if (child && child.type) {
            return ReactOps.render(child, executionPath, props);
        }

        return child;

    }

    private static async applyFileSystem(node: React.ReactNode) {

        if (!node || typeof node !== "object") {
            return node;
        }

        const element = node as IReactOpsElement;

        switch (element.type) {
            case "file": {
                await element.props.$fs
                    .writeAsString(
                        Path.join(element.props.$chroot, element.props.name),
                        element.props.children as string,
                        "utf8");
                break;
            }
            case "folder": {
                await element.props.$fs.mkdir(Path.join(element.props.$chroot));
                await Promise
                    .all((element.props.children as React.ReactNode[])
                        .map(child => ReactOps.applyFileSystem(child)));
                break;
            }
            default: {
                console.log("NOT SURE", element);
            }
        }
    }



}
