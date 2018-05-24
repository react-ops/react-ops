import "jest";
import * as React from "react";
import { ReactOps } from "../ReactOps";
import * as util from "util";
import { Composition, Container, Volume } from "../packages";
import { Set } from "../primitives";

describe("ReactOps", () => {

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

        const publicFiles = <Volume name="public" />

        console.log(await ReactOps.render(
            <Set>
                <Composition name={"abc"}>
                    <Container/>
                </Composition>
            </Set>
            , __dirname, null));

    });
});
