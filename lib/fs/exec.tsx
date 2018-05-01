
import * as React from "react";
import { ReactOps, IReactOpsProps, ReactOpsComponent } from "../react.ops";
import * as path from "path";
import { exec } from "child_process";
/**
 * Ensures folder exists
 */
export class Exec extends ReactOpsComponent<{
    cmd: string;
}> {


    async render() {

        const props = this.props;

        props.reporter("Executing " + props.cmd);

        return new Promise((resolve, reject) => {

            exec(`cd ${props._base} && ${props.cmd}`, (error, stdout, stderr) => {
                if (error) {
                    props.reporter("Error while shell exec " + props.cmd);
                    console.error(error);
                    return resolve(null);

                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                return resolve(this.props.children);
            });
        });
    }
}

