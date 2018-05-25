import "jest";
import * as React from "react";
import * as path from "path";
import {
    File
} from "../File";
import {
    ReactOps
} from "../../ReactOps";
import {
    IReactOpsElement,
    IReactOpsProps
} from "../../index.d"

describe("lib/primitives/File", () => {

    it("Renders proper output", async () => {

        const Dump = (props: any) => props;

        const file = (await ReactOps.render(
            <File
                name="filename"
            ><Dump /></File>
            , __dirname, {
                $dry: true
            })) as IReactOpsElement

        const abs = path.join(__dirname, "filename");

        expect(file.type).toEqual("file")
        expect(file.props.name).toEqual("filename");
        expect(file.props.$chroot).toEqual(__dirname);

        expect(Array.isArray(file.props.children)).toEqual(true);

        const children = (file.props.children as IReactOpsProps[]);
        expect(children.length).toEqual(1);
        expect(children[0].$chroot).toEqual(__dirname);
        expect(children[0].$fs).toEqual(file.props.$fs);
        expect(children[0].$dry).toEqual(file.props.$dry);
        expect(children[0].name).not.toEqual(file.props.name);

    });

});
