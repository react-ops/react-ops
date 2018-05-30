import "jest";
import * as React from "react";
import * as path from "path";
import {
    YAML,
} from "../YAML";
import {
    File
} from "../File"
import {
    ReactOps
} from "../../ReactOps";
import {
    IReactOpsElement,
    IReactOpsProps
} from "../../index.d"
import * as util from "util";

describe("lib/primitives/YAML", () => {

    it("Renders proper output", async () => {

        const Dump = (props: any) => "dump";

        expect(await ReactOps.render(
            <YAML><Dump /></YAML>
            , __dirname, {
                $dry: true
            })).toEqual("dump\n");

        const abs = path.join(__dirname, "filename");

        expect(ReactOps.cleanup(await ReactOps.render(
            <File name="a">
                <YAML>
                    {{
                        "a": "A"
                    }}
                </YAML>
            </File>
            , __dirname, {
                $dry: true
            })))
            .toEqual({
                type: 'file',
                key: 'a',
                props: { name: 'a', children: ["a: A\n"] }
            });

        expect(ReactOps.cleanup(await ReactOps.render(
            <YAML>
                {{
                    "a": "A"
                }}
            </YAML>
            , __dirname, {
                $dry: true
            }))).toEqual("a: A\n")


        /*
     
     
     
        expect(file.type).toEqual("file")
        expect(file.props.name).toEqual("filename");
        expect(file.props.$chroot).toEqual(__dirname);
     
        expect(Array.isArray(file.props.children)).toEqual(true);
     
        const children = (file.props.children as IReactOpsProps[]);
        expect(children.length).toEqual(1);
        expect(children[0].$chroot).toEqual(__dirname);
        expect(children[0].$fs).toEqual(file.props.$fs);
        expect(children[0].$dry).toEqual(file.props.$dry);
        expect(children[0].name).not.toEqual(file.props.name);*/

    });

});
