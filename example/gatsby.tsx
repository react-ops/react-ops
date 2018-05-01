import * as React from "react";
import {
    ReactOps,
    IReactOpsProps,
    ReactOpsComponent,
    Folder,
    NPMGlobal,
    RimRaf,
    Exec,
    Cd
} from "../lib";
import * as path from "path";

const S3 = (props: {
    name: string;
    website?: boolean;
    children: JSX.Element
}) => {
    console.log("S3", props);
    return props.children;
};

const CloudFront = (props) => {
    console.log("CloudFront", props);
    return props.children;
};

const Route53Domain = (props) => {
    console.log("Route53Domain", props);
    return props.children;
};

const AWSSSL = (props) => {
    console.log("AWSSSL", props);
    return props.children;
};

const S3SLLStaticWebsite = (props: {
    host: string
} & IReactOpsProps) => {
    props.reporter("Setting S3 static website " + props.host);
    const ssl = <AWSSSL domain={props.host} />
    const s3 = <S3 website={true} name={props.host}>
        {props.children}
    </S3 >;
    const cache = <CloudFront aliases={[props.host]} ssl={ssl} target={s3} />
    const domain = <Route53Domain host={props.host} target={cache} />;
    return s3;
}

const ShellJob = (props: {
    cmd: string;
} & IReactOpsProps) => {
    props.reporter("Shell command " + props.cmd);
    return props.children;
}

const GitRepo = (props) => {
    console.log("GitRepo", props);
    return props.children;
}

ReactOps.render(
    <NPMGlobal dependency="gatsby-cli">
        <RimRaf path="gatsby-site">
            <Exec cmd="gatsby new gatsby-site">
                <Cd path="gatsby-site">
                    <Exec cmd="gatsby build">
                        <Cd path="public"/>
                    </Exec>
                </Cd>
            </Exec>
        </RimRaf>
    </NPMGlobal>
    , path.join(__dirname, "..", ".."));
