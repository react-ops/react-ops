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
        console.log("A")
        const { virtualDom, fs } = await ReactOps.virtualDomAndFS(element, executionPath, inputProps);
        console.log("B")
        const state = await ReactOps.collect(executionPath, fs);
        console.log("C")
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
        const { children, $fs, $chroot, $dry, ...props } = element.props;

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

            const items = await fs.ls(path);

            return {
                type: "folder",
                key: name,
                props: {
                    name,
                    children: await Promise.all(items.map(child => ReactOps.collect(Path.join(path, child), fs)))
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

        const content: TReactOpsNode = ReactOps.invokeRender(element, parentProps);
        const asElement = content as React.ReactElement<TReactOpsProps>;
        const children = ReactOps.children(asElement)

        if (children) {
            return {
                ...asElement,
                props: await ReactOps.renderChildren(children, asElement.props, executionPath)
            };
        }

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

    private static children(content: React.ReactElement<TReactOpsProps>): null | React.ReactNode[] {
        if (content && content.props && content.props.children) {
            if (Array.isArray(content.props.children)) {
                return content.props.children;
            }
            return [content.props.children];
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
            ...props,
            children: childNodes
        }
    }

    private static invokeRender(element: IReactOpsElement, inputProps?: TReactOpsProps): TReactOpsNode {

        if (typeof element.type !== "string") {

            const ElementType = element.type as TReactOpsElement;
            let props = { ...inputProps, ...element.props };

            if (shouldConstruct(ElementType)) {
                const instance = new (ElementType as TReactOpsComponentClass)(props);
                return instance.render();
            } else {
                return (ElementType as TReactOpsStatelessComponent)(props);

            }
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

        return null;

    }

    private static async applyFileSystem(node: React.ReactNode) {

        if (!node || typeof node !== "object") {
            return node;
        }

        const element = node as IReactOpsElement;

        switch (element.type) {
            case "file": {
                console.log(Path.join(element.props.$chroot));
                console.log(ReactOps.toString(element));
                // await element.props.$fs
                //     .writeAsString(
                //         Path.join(element.props.$chroot, element.props.name),
                //         ReactOps.toString(element),
                //         "utf8");
                break;
            }
            case "folder": {
                console.log(Path.join(element.props.$chroot));
                // await element.props.$fs.mkdir(Path.join(element.props.$chroot));
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

    private static toString(node: IReactOpsElement) {
        if (node.props && node.props.children && Array.isArray(node.props.children)) {
            return (node.props.children as React.ReactNode[])
                .map(node => {
                    if (!node || typeof node !== "object") {
                        return String(node);
                    }
                    return ReactOps.toString(node as IReactOpsElement);
                })
                .join("")

        }
        return "";
    }

}
