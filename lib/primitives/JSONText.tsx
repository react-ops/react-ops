import * as React from "react";
import {
    ReactOpsComponent,
} from "./Component";
import {
    IReactOpsNode
} from "../index.d"

export interface IJSONProps {
    pretty: boolean,
    key?: string,
    children?: React.ReactNode
}

const format = (data: any, pretty: boolean) =>
{
    return pretty
        ? JSON.stringify(data, null, 4)
        : JSON.stringify(data)
}


export const JSONText = (props: IJSONProps & Readonly<{ children?: React.ReactNode }>) =>
{
    return Array.isArray(props.children)
        ? props.children.map(child => format(child, props.pretty)).join("\n")
        : format(props.children, props.pretty);

}
