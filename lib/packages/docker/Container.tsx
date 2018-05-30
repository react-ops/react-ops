import * as React from "react";
import {
    File
} from "../../primitives";

interface IContainerProps {
    from: string;
    steps: string;
    command: string;
    name: string;
}

export const Container = (props) => (
    <File name={props.name}>{
        `from ${props.from} \n`
        + `${props.steps}`
        + (props.command
            ? "\nCMD " + JSON.stringify(props.command)
            : ""
        )
        + "\n"
    }</File>
)
