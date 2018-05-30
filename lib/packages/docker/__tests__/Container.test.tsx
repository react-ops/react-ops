import "jest";
import * as React from "react";
import * as path from "path";
import {
    ReactOps
} from "../../../ReactOps";
import {
    IReactOpsElement,
    IReactOpsProps
} from "../../../index.d"
import {
    VirtualFileSystem
} from "../../../utils";
import {
    Container
} from "../Container";

describe("lib/packages/docker/Container", () => {

    it("Renders proper output", async () => {

        const START_SCRIPT = "override";

        const container = await ReactOps.render(<Container
            from="node:8"
            steps={`
RUN apt-get update

COPY ./express-build /express
COPY ./express/package.json /express/package.json
COPY ./overrides /overrides

ARG START_SCRIPT
ARG STAGE

RUN echo ${START_SCRIPT}

COPY ${START_SCRIPT} /start.sh

RUN rm -rf /express/node_modules

COPY ./express-build/host.js /host.js

WORKDIR /express

EXPOSE 3000-3099  
VOLUME /build
VOLUME /log

RUN rm -rf /usr/local/bin/yarnpkg # because node image is broken
RUN rm -rf /usr/local/bin/yarn # because node image is broken

RUN npm i -g yarn

RUN yarn global add gulp-cli

RUN yarn --non-interactive; exit 0

RUN chmod +x /start.sh
`}
            command={`/start.sh`}

        />, __dirname, {
                $fs: new VirtualFileSystem()
            })


    });

});
