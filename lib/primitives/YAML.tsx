import * as React from "react";
import * as yaml from "js-yaml";
import { IJSONProps } from "./JSONText"

const format = (data: any, pretty: boolean) =>
    yaml.safeDump(data);

export const YAML = (props: IJSONProps & Readonly<{ children?: React.ReactNode }>) =>
    Array.isArray(props.children)
        ? props.children.map(child => format(child, props.pretty)).join("\n")
        : format(props.children, props.pretty);



