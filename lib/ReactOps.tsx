import * as React from "react";
import { Observable } from "rxjs";
import * as debug from "debug";
import * as fs from "fs";
import {
    IReactOpsElement,
    IReactOpsNode,
    IReactOpsProps,
    TReactOpsComponentClass,
    TReactOpsElement,
    TReactOpsNode,
    TReactOpsProps,
    TReactOpsStatelessComponent
} from "./index.d";

const shouldConstruct = (Component) => Component.prototype && Component.prototype.isReactComponent;

export class ReactOps {

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

        const content: TReactOpsNode = ReactOps.invokeRender(element, inputProps);
        const asElement = content as React.ReactElement<TReactOpsProps>;
        const children = ReactOps.children(asElement)

        if (children) {
            return {
                ...asElement,
                props: ReactOps.renderChildren(children, asElement.props, executionPath)
            };
        }

        return content;
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

}
