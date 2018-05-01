
import * as React from "react";
import { ReactOps, IReactOpsProps, ReactOpsComponent } from "../react.ops";
import * as path from "path";
import * as rimraf from "rimraf";
/**
 * Ensures folder exists
 */
export class RimRaf extends ReactOpsComponent<{
    path: string;
}> {

    async exists(fullPath: string) {
        return new Promise((resolve, reject) => {
            this.props._fs.stat(fullPath, (error, stats) => {
                if (error) {
                    if (error.code === "ENOENT") {
                        return resolve(false);
                    }
                    return reject(error);
                }
                resolve(true);
            });
        });
    }

    async truncate(fullPath: string) {
        return new Promise((resolve, reject) => {
            rimraf(fullPath, error => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

    async render() {

        const props = this.props;
        const fullPath = path.join(props._base, props.path);

        props.reporter("Rimraf " + fullPath);

        try {
            const exists = await this.exists(fullPath);

            if (exists === false) {
                return props.children;
            } else {
                await this.truncate(fullPath);
                return props.children;
            }

        } catch (exception) {
            props.reporter("Error while rimraf " + props.path);
            console.error(exception);
            return null;
        }
    }
}

