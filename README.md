# react-ops

> Use JSX to build your architecture, deployment and testing. You can even make it Reactive!

This repository is Very In Progress and not ready for production!

## Working example 

```jsx
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
```

## Desired cases

```jsx

// or

const StaticS3Website = (props) => {
    const bucket = <S3 name={props.host} website={true} sync={props._base}/>;
    const ssl = <AWSSSL host={props.host} />;
    const cloudFront = <CloudFront target={bucket} invalidate="*" ssl={ssl} alias={props.host} />;
    const domain = <Route53 domain={props.host} target={cloudFront}/>;
    return [
        bucket,
        ssl,
        cloudFront,
        domain        
    ];
}

// or

ReactOps.render(    
    <NPMGlobal dependency="gatsby-cli">
        <RimRaf path="gatsby-site">
            <Exec cmd="gatsby new gatsby-site">
                <Cd path="gatsby-site">
                    <Exec cmd="gatsby build">
                        <Cd path="public">
                            <StaticS3Website
                                host="example.com"
                                ssl={true}
                            />    
                        </Cd>
                    </Exec>
                </Cd>
            </Exec>
        </RimRaf>
    </NPMGlobal>
    , path.join(__dirname, "..", ".."));
```

but also

```jsx

const instances = new Array(100);

ReactOps.render(    
    <ELB host="example.com" ssl={true}>
        {
            instances
                .map((_, index) => 
                    <EC2 ami="foo">
                        <Apt package="docker"/>
                        <Apt package="git"/>
                        <Repo path="/build" url="git+ssh://...">
                            <DockerUp env={{
                                instanceName: index
                            }}/>
                        </Repo>
                    </EC2>
                )
        }
    </ELB>
    , path.join(__dirname, "..", ".."));
```

```

## Licence

MIT
