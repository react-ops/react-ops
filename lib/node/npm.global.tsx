
import * as React from "react";
import { ReactOps, IReactOpsProps, ReactOpsComponent } from "../react.ops";
import * as path from "path";
import * as npm from "npm";

/**
 * Ensures folder exists
 */
export class NPMGlobal extends ReactOpsComponent<{
    dependency: string;
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

    async install() {
        return new Promise((resolve, reject) => npm.commands.install(path.resolve(npm.globalDir, '..'), [
            this.props.dependency
        ], (err, result) => {
            if (err) {
                return reject(err);
            }
            console.log(result);
            resolve(result);
        }));
    }

    async render() {

        const props = this.props;

        props.reporter("Ensure npm global dependency is installed " + props.dependency);

        try {
            // npm.load({});
            await new Promise((resolve, reject) => {
                npm.load(error => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            });
            // console.log();
            // console.log("deps", props.dependency);

            const isDirectory = await this.isDirectory(path.join(npm.globalDir, props.dependency));

            if (isDirectory === true) {
                return props.children;
            } else if (isDirectory === "ENOENT" && !props._dry) {
                await this.install();
                return props.children;
            }

            return null;

        } catch (exception) {
            props.reporter("Error ensuring global dependency " + props.dependency);
            console.error(exception);
            return null;
        }
    }
}

