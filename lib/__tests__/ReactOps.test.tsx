import "jest";
import * as React from "react";
import * as path from "path";
import { ReactOps } from "../ReactOps";
import * as util from "util";
import { Composition, Container, Volume } from "../packages";
import { Set } from "../primitives";
import {
    LocalFileSystem,
    VirtualFileSystem
} from "../utils"
import { File, Folder } from "../primitives";
import * as rimraf from "rimraf";
import { IFileSystem } from "..";

const MOCKUP = require("./snapshot.mockup.json");

jest.setTimeout(1000)

describe("ReactOps", () => {

    beforeEach(async () => {
        return await new Promise((resolve, reject) => rimraf(path.join(__dirname, ".test"), error =>
            error ? reject(error) : resolve()
        ));
    })

    afterEach(async () => {
        return await new Promise((resolve, reject) => rimraf(path.join(__dirname, ".test"), error =>
            error ? reject(error) : resolve()
        ));
    })

    it("renders", async () => {

        expect(await ReactOps.render(null, __dirname, null)).toBeNull();

        const PureNullComponent = props => null;
        const PureComponent = props => ({
            type: PureComponent,
            key: null,
            props
        });

        expect(await ReactOps.render(<PureNullComponent />, __dirname, null)).toBeNull();
        expect(await ReactOps.render(<PureComponent />, __dirname, null)).not.toBeNull();
        expect(await ReactOps.render(<span><strong><a /></strong></span>, __dirname, null)).not.toBeNull();


    });

    it("renders files content properly", async () => {

        const A = (props) => props.children.join("\n")
        const B = (props) => props.name;
        const C = (props) => JSON.stringify({ Z: [props.name] });

        expect(ReactOps.cleanup(await ReactOps.render(
            <File name="abc">Abc</File>
            , __dirname, {
                $fs: new VirtualFileSystem()
            })))
            .toEqual({
                type: 'file',
                key: 'abc',
                props: { name: 'abc', children: ['Abc'] }
            })

        expect(ReactOps.cleanup(await ReactOps.render(
            <File name="abc">
                <B name="foo" />
                <B name="bar" />
                <B name="goo">
                    Zoo
            </B>
            </File>,
            __dirname, {
                $fs: new VirtualFileSystem()
            })))
            .toEqual({
                type: 'file',
                key: 'abc',
                props: { name: 'abc', children: ['foo', 'bar', 'goo'] }
            })

        expect(ReactOps.cleanup(await ReactOps.render(
            <File name="abc">
                <A name="foo" >
                    <B name="bar" />
                    <B name="goo" />
                    ZONE
                </A>
            </File>,
            __dirname, {
                $fs: new VirtualFileSystem()
            })))
            .toEqual({
                type: 'file',
                key: 'abc',
                props: { name: 'abc', children: ['bar\ngoo\nZONE'] }
            })


        expect(ReactOps.cleanup(await ReactOps.render(
            <File name="abc">
                {"some text"}
                <A name="A">
                    <B name="foo" />
                    <A name="bar">
                        <C name="goo" />
                        <C name="goo" />
                        <C name="goo" />
                    </A>
                </A>
            </File>
            , __dirname, {
                $fs: new VirtualFileSystem()
            })))
            .toEqual({
                type: 'file',
                key: 'abc',
                props:
                    {
                        name: 'abc',
                        children: [
                            'some text',
                            'foo\n{"Z":["goo"]}\n{"Z":["goo"]}\n{"Z":["goo"]}'
                        ]
                    }
            });

    })

    it("collects", async () => {

        const fs = new VirtualFileSystem();
        await fs.mkdir("/A/B/C/D");
        await fs.mkdir("/A/E/F");
        await fs.mkdir("/A/E/G/H/I");
        await fs.writeAsString("/J", "J", "utf8");
        await fs.writeAsString("/A/K", "K", "utf8");
        await fs.writeAsString("/A/E/Z/L", "L", "utf8");
        await fs.writeAsString("/A/B/C/M", "M", "utf8");

        const model = await ReactOps.collect("/", fs);

        expect(model).toEqual(MOCKUP);

    });

    it("diffs", async () => {

        const fs = new VirtualFileSystem();
        await fs.mkdir("/A/B/C/D");
        await fs.mkdir("/A/E/F");
        await fs.mkdir("/A/E/G/H/I");
        await fs.writeAsString("/J", "J", "utf8");
        await fs.writeAsString("/A/K", "K", "utf8");
        await fs.writeAsString("/A/E/Z/L", "L", "utf8");
        await fs.writeAsString("/A/B/C/M", "M", "utf8");

        expect(await ReactOps.diff(
            <Folder name="">
                <Folder name="A">
                    <Folder name="B">
                        <Folder name="C">
                            <Folder name="D" />
                            <File name="M">M</File>
                        </Folder>
                    </Folder>
                    <Folder name="E">
                        <Folder name="F" />
                        <Folder name="G">
                            <Folder name="H">
                                <Folder name="I" />
                            </Folder>
                        </Folder>
                        <Folder name="Z">
                            <File name="L">L</File>
                        </Folder>
                    </Folder>
                    <File name="K">K</File>
                </Folder>
                <File name="J">J</File>
            </Folder>, "/", {
                $fs: fs
            })).toBeUndefined();

        expect(await ReactOps.diff(
            <Folder name="">
                <Folder name="A">
                    <Folder name="B">
                        <Folder name="K" />
                    </Folder>
                    <Folder name="E">
                        <Folder name="F" />
                        <Folder name="G">
                            <Folder name="H">
                                <Folder name="I" />
                            </Folder>
                        </Folder>
                        <Folder name="Z">
                            <File name="L">L</File>
                        </Folder>
                    </Folder>
                    <File name="K">K</File>
                </Folder>
                <File name="J">J</File>
            </Folder>, "/", {
                $fs: fs
            })).toEqual({ "props": { "children": { "0": { "props": { "children": { "0": { "props": { "children": { "0": { "key": ["K", "C"], "props": { "name": ["K", "C"], "children": { "0": [{ "type": "folder", "key": "D", "props": { "name": "D", "children": [] } }], "1": [{ "type": "file", "key": "M", "props": { "name": "M", "children": ["M"] } }], "_t": "a" } } }, "_t": "a" } } }, "_t": "a" } } }, "_t": "a" } } });

        expect(await ReactOps.diff(
            <Folder name="">
                <Folder name="A">
                    <Folder name="B">
                        <Folder name="K" />
                    </Folder>
                    <Folder name="E">
                        <Folder name="F" />
                        <Folder name="G">
                            <Folder name="H">
                                <Folder name="I" />
                            </Folder>
                        </Folder>
                        <Folder name="Z">
                            <File name="L">L</File>
                        </Folder>
                    </Folder>
                    <File name="K">K</File>
                </Folder>
                <File name="J">J</File>
            </Folder>, "/", {
                $fs: fs
            }, true)).toEqual("{\n  \u001b[90mkey: \u001b[39m\u001b[90m\"\"\u001b[39m\n  props: {\n    children: [\n      0: {\n        \u001b[90mkey: \u001b[39m\u001b[90m\"A\"\u001b[39m\n        props: {\n          children: [\n            0: {\n              \u001b[90mkey: \u001b[39m\u001b[90m\"B\"\u001b[39m\n              props: {\n                children: [\n                  0: {\n                    key: \u001b[31m\"K\"\u001b[39m => \u001b[32m\"C\"\u001b[39m\n                    props: {\n                      children: [\n                        \u001b[32m0: \u001b[39m\u001b[32m{\u001b[39m\n\u001b[32m                          \"type\": \"folder\",\u001b[39m\n\u001b[32m                          \"key\": \"D\",\u001b[39m\n\u001b[32m                          \"props\": {\u001b[39m\n\u001b[32m                            \"name\": \"D\",\u001b[39m\n\u001b[32m                            \"children\": []\u001b[39m\n\u001b[32m                          }\u001b[39m\n\u001b[32m                        }\u001b[39m\n                        \u001b[32m1: \u001b[39m\u001b[32m{\u001b[39m\n\u001b[32m                          \"type\": \"file\",\u001b[39m\n\u001b[32m                          \"key\": \"M\",\u001b[39m\n\u001b[32m                          \"props\": {\u001b[39m\n\u001b[32m                            \"name\": \"M\",\u001b[39m\n\u001b[32m                            \"children\": [\u001b[39m\n\u001b[32m                              \"M\"\u001b[39m\n\u001b[32m                            ]\u001b[39m\n\u001b[32m                          }\u001b[39m\n\u001b[32m                        }\u001b[39m\n                      ]\n                      name: \u001b[31m\"K\"\u001b[39m => \u001b[32m\"C\"\u001b[39m\n                    },\n                    \u001b[90mtype: \u001b[39m\u001b[90m\"folder\"\u001b[39m\n                  }\n                ]\n                \u001b[90mname: \u001b[39m\u001b[90m\"B\"\u001b[39m\n              },\n              \u001b[90mtype: \u001b[39m\u001b[90m\"folder\"\u001b[39m\n            },\n            \u001b[90m1: \u001b[39m\u001b[90m{\u001b[39m\n\u001b[90m              \"type\": \"folder\",\u001b[39m\n\u001b[90m              \"key\": \"E\",\u001b[39m\n\u001b[90m              \"props\": {\u001b[39m\n\u001b[90m                \"name\": \"E\",\u001b[39m\n\u001b[90m                \"children\": [\u001b[39m\n\u001b[90m                  {\u001b[39m\n\u001b[90m                    \"type\": \"folder\",\u001b[39m\n\u001b[90m                    \"key\": \"F\",\u001b[39m\n\u001b[90m                    \"props\": {\u001b[39m\n\u001b[90m                      \"name\": \"F\",\u001b[39m\n\u001b[90m                      \"children\": []\u001b[39m\n\u001b[90m                    }\u001b[39m\n\u001b[90m                  },\u001b[39m\n\u001b[90m                  {\u001b[39m\n\u001b[90m                    \"type\": \"folder\",\u001b[39m\n\u001b[90m                    \"key\": \"G\",\u001b[39m\n\u001b[90m                    \"props\": {\u001b[39m\n\u001b[90m                      \"name\": \"G\",\u001b[39m\n\u001b[90m                      \"children\": [\u001b[39m\n\u001b[90m                        {\u001b[39m\n\u001b[90m                          \"type\": \"folder\",\u001b[39m\n\u001b[90m                          \"key\": \"H\",\u001b[39m\n\u001b[90m                          \"props\": {\u001b[39m\n\u001b[90m                            \"name\": \"H\",\u001b[39m\n\u001b[90m                            \"children\": [\u001b[39m\n\u001b[90m                              {\u001b[39m\n\u001b[90m                                \"type\": \"folder\",\u001b[39m\n\u001b[90m                                \"key\": \"I\",\u001b[39m\n\u001b[90m                                \"props\": {\u001b[39m\n\u001b[90m                                  \"name\": \"I\",\u001b[39m\n\u001b[90m                                  \"children\": []\u001b[39m\n\u001b[90m                                }\u001b[39m\n\u001b[90m                              }\u001b[39m\n\u001b[90m                            ]\u001b[39m\n\u001b[90m                          }\u001b[39m\n\u001b[90m                        }\u001b[39m\n\u001b[90m                      ]\u001b[39m\n\u001b[90m                    }\u001b[39m\n\u001b[90m                  },\u001b[39m\n\u001b[90m                  {\u001b[39m\n\u001b[90m                    \"type\": \"folder\",\u001b[39m\n\u001b[90m                    \"key\": \"Z\",\u001b[39m\n\u001b[90m                    \"props\": {\u001b[39m\n\u001b[90m                      \"name\": \"Z\",\u001b[39m\n\u001b[90m                      \"children\": [\u001b[39m\n\u001b[90m                        {\u001b[39m\n\u001b[90m                          \"type\": \"file\",\u001b[39m\n\u001b[90m                          \"key\": \"L\",\u001b[39m\n\u001b[90m                          \"props\": {\u001b[39m\n\u001b[90m                            \"name\": \"L\",\u001b[39m\n\u001b[90m                            \"children\": [\u001b[39m\n\u001b[90m                              \"L\"\u001b[39m\n\u001b[90m                            ]\u001b[39m\n\u001b[90m                          }\u001b[39m\n\u001b[90m                        }\u001b[39m\n\u001b[90m                      ]\u001b[39m\n\u001b[90m                    }\u001b[39m\n\u001b[90m                  }\u001b[39m\n\u001b[90m                ]\u001b[39m\n\u001b[90m              }\u001b[39m\n\u001b[90m            }\u001b[39m\n            \u001b[90m2: \u001b[39m\u001b[90m{\u001b[39m\n\u001b[90m              \"type\": \"file\",\u001b[39m\n\u001b[90m              \"key\": \"K\",\u001b[39m\n\u001b[90m              \"props\": {\u001b[39m\n\u001b[90m                \"name\": \"K\",\u001b[39m\n\u001b[90m                \"children\": [\u001b[39m\n\u001b[90m                  \"K\"\u001b[39m\n\u001b[90m                ]\u001b[39m\n\u001b[90m              }\u001b[39m\n\u001b[90m            }\u001b[39m\n          ]\n          \u001b[90mname: \u001b[39m\u001b[90m\"A\"\u001b[39m\n        },\n        \u001b[90mtype: \u001b[39m\u001b[90m\"folder\"\u001b[39m\n      },\n      \u001b[90m1: \u001b[39m\u001b[90m{\u001b[39m\n\u001b[90m        \"type\": \"file\",\u001b[39m\n\u001b[90m        \"key\": \"J\",\u001b[39m\n\u001b[90m        \"props\": {\u001b[39m\n\u001b[90m          \"name\": \"J\",\u001b[39m\n\u001b[90m          \"children\": [\u001b[39m\n\u001b[90m            \"J\"\u001b[39m\n\u001b[90m          ]\u001b[39m\n\u001b[90m        }\u001b[39m\n\u001b[90m      }\u001b[39m\n    ]\n    \u001b[90mname: \u001b[39m\u001b[90m\"\"\u001b[39m\n  },\n  \u001b[90mtype: \u001b[39m\u001b[90m\"folder\"\u001b[39m\n}");

    })

    it("applies", async () => {

        await Promise
            .all([
                //new VirtualFileSystem(),
                new LocalFileSystem(path.join(__dirname, ".test"))
            ]
                .map(async (fs: IFileSystem) => {

                    await fs.mkdir("/A/B/C/D");
                    await fs.mkdir("/A/E/F");
                    await fs.mkdir("/A/E/G/H/I");
                    await fs.writeAsString("/J", "J", "utf8");
                    await fs.writeAsString("/A/K", "K", "utf8");
                    await fs.writeAsString("/A/E/Z/L", "L", "utf8");
                    await fs.writeAsString("/A/B/C/M", "M", "utf8");

                    expect(await ReactOps.diff(
                        <Folder name="">
                            <Folder name="A">
                                <Folder name="B">
                                    <Folder name="C">
                                        <Folder name="D" />
                                        <File name="M">M</File>
                                    </Folder>
                                </Folder>
                                <Folder name="E">
                                    <Folder name="F" />
                                    <Folder name="G">
                                        <Folder name="H">
                                            <Folder name="I" />
                                        </Folder>
                                    </Folder>
                                    <Folder name="Z">
                                        <File name="L">L</File>
                                    </Folder>
                                </Folder>
                                <File name="K">K</File>
                            </Folder>
                            <File name="J">J</File>
                        </Folder>, "/", {
                            $fs: fs
                        })).toBeUndefined();

                    // // no changes
                    await ReactOps.apply(
                        <Folder name="">
                            <Folder name="A">
                                <Folder name="B">
                                    <Folder name="C">
                                        <Folder name="D" />
                                        <File name="M">M</File>
                                    </Folder>
                                </Folder>
                                <Folder name="E">
                                    <Folder name="F" />
                                    <Folder name="G">
                                        <Folder name="H">
                                            <Folder name="I" />
                                        </Folder>
                                    </Folder>
                                    <Folder name="Z">
                                        <File name="L">L</File>
                                    </Folder>
                                </Folder>
                                <File name="K">K</File>
                            </Folder>
                            <File name="J">J</File>
                        </Folder>, "", {
                            $fs: fs
                        });

                    expect(await ReactOps.diff(
                        <Folder name="">
                            <Folder name="A">
                                <Folder name="B">
                                    <Folder name="C">
                                        <Folder name="D" />
                                        <File name="M">M</File>
                                    </Folder>
                                </Folder>
                                <Folder name="E">
                                    <Folder name="F" />
                                    <Folder name="G">
                                        <Folder name="H">
                                            <Folder name="I" />
                                        </Folder>
                                    </Folder>
                                    <Folder name="Z">
                                        <File name="L">L</File>
                                    </Folder>
                                </Folder>
                                <File name="K">K</File>
                            </Folder>
                            <File name="J">J</File>
                        </Folder>, "/", {
                            $fs: fs
                        })).toBeUndefined();

                    // changes - we assume ReactOps doesn't delete files now
                    await ReactOps.apply(
                        <Folder name="">
                            <Folder name="A">
                                <Folder name="B">
                                    <File name="K">KKKK</File>
                                </Folder>
                            </Folder>
                            <File name="J">JABA THE HUT</File>
                        </Folder>, "", {
                            $fs: fs
                        });

                    expect(await ReactOps.diff(
                        <Folder name="">
                            <Folder name="A">
                                <Folder name="B">
                                    <Folder name="C">
                                        <Folder name="D" />
                                        <File name="M">M</File>
                                    </Folder>
                                    <File name="K">KKKK</File>
                                </Folder>
                                <Folder name="E">
                                    <Folder name="F" />
                                    <Folder name="G">
                                        <Folder name="H">
                                            <Folder name="I" />
                                        </Folder>
                                    </Folder>
                                    <Folder name="Z">
                                        <File name="L">L</File>
                                    </Folder>
                                </Folder>
                                <File name="K">K</File>
                            </Folder>
                            <File name="J">JABA THE HUT</File>
                        </Folder>, "/", {
                            $fs: fs
                        })).toBeUndefined();
                }));
    })
});
