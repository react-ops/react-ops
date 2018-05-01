
import * as React from "react";
import { ReactOps, IReactOpsProps, ReactOpsComponent } from "../react.ops";
import * as path from "path";

/**
 * Ensures folder exists
 */
export class Folder extends ReactOpsComponent<{
    path: string;
}> {

    async isDirectory(fullPath: string) {
        return new Promise((resolve, reject) => {
            this.props._fs.stat(fullPath, (error, stats) => {
                if (error) {
                    if (error.code === "ENOENT") {
                        return resolve(error.code);
                    }
                    return reject(error);
                }
                resolve(stats.isDirectory());
            });
        });
    }

    async createDirectory(fullPath: string) {
        const props = this.props;
        props.reporter("Creating folder " + props.path);
        try {
            await new Promise((resolve, reject) => {
                props._fs.mkdir(fullPath, null, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve();
                });
            });
        } catch (exception) {
            props.reporter("Error Creating folder " + props.path);
            console.error(exception);
            return null;
        }
        return props.children;

    }

    async render() {

        const props = this.props;
        const fullPath = path.join(props._base, props.path);

        props.reporter("Ensure folder " + props.path);

        try {
            const isDirectory = await this.isDirectory(fullPath);

            if (isDirectory === true) {
                return props.children;
            } else if (isDirectory === "ENOENT" && !props._dry) {
                return this.createDirectory(fullPath);
            }

            return null;
            
        } catch (exception) {
            props.reporter("Error ensuring folder " + props.path);
            console.error(exception);
            return null;
        }
    }
}

