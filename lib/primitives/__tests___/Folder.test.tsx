import "jest";
import * as React from "react";
import * as path from "path";
import {
    Folder
} from "../Folder";
import {
    ReactOps
} from "../../ReactOps";
import {
    IReactOpsElement,
    IReactOpsProps
} from "../../index.d"

describe("lib/primitives/Folder", () => {

    it("Renders proper output", async () => {

        const Dump = (props: any) => props;

        const folder = (await ReactOps.render(
            <Folder
                name="foldername"
            ><Dump /></Folder>
            , __dirname, {
                $dry: true
            })) as IReactOpsElement

        const abs = path.join(__dirname, "foldername");

        expect(folder.type).toEqual("folder")
        expect(folder.props.name).toEqual("foldername");
        expect(folder.props.$chroot).toEqual(abs);

        expect(Array.isArray(folder.props.children)).toEqual(true);

        const children = (folder.props.children as IReactOpsProps[]);
        expect(children.length).toEqual(1);
        expect(children[0].$chroot).toEqual(abs);
        expect(children[0].$fs).toEqual(folder.props.$fs);
        expect(children[0].$dry).toEqual(folder.props.$dry);
        expect(children[0].name).not.toEqual(folder.props.name);

    });

});
