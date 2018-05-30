# react-ops

> Use JSX to build your architecture, deployment and testing. You can even make it Reactive!

This repository is Very In Progress and not ready for production!

## Idea

 * Write your deployment using JSX
 * Using pure functions limits side effects
 * You can have process listening to external events (i.e. traffic, git merge), which triggers infrastructure update by
   updating props in the tree

```jsx

<Project>
  <Composition>
    <Service name="nginx">
      <Container 
        name="nginx"
        from="nginx:1.14.0"
        steps={[
          <File target="/etc/nginx/nginx.conf">
            <NginxConfig>
              {{
                user: "www-data",
                worker_processes: 4,
                pid: "/run/nginx.pid",
                events: {
                  worker_connections: 768
                },
                http: {
                  sendfile: true,
                  tcp_nopush: true,
                  tcp_nodelay: true,
                  keepalive_timeout: 65,
                  types_hash_max_size: 2048,
                  server_tokens: false,
                  include$1: "/etc/nginx/mime.types",
                  default_type: "application/octet-stream",
                  access_log: "/var/log/nginx/access.log",              
                  error_log: "/var/log/nginx/error.log"
                  gzip: true,
                  gzip_disable: "msie6",
                  gzip_vary: true,
                  gzip_proxied: "any",
                  gzip_comp_level: 6,
                  gzip_buffers: "16 8k";
                  gzip_http_version: "1.1";
                  gzip_types: [
                      "text/plain",
                      "text/css",
                      "text/javascript", 
                      "text/xml",
                      "application/json",
                      "application/javascript",
                      "application/x-javascript",
                      "application/xml",
                      "application/xml+rss",
                      "image/svg+xml"
                  ],
                  include$2: "/etc/nginx/conf.d";
                }
              }}
            </NginxConfig>
          </TmpFile>
          <File target="/etc/nginx/sites-enabled/app">
            <NginxConfig>
              {{
                "upstream$node_servers": new Array(nodesCount)
                  .map((_, index) => 3000 + index)
                  .reduce((p, c) => {
                    p["server$" + c] = "nodejs:" + c;
                    return p
                  }, {ip_hash: ""})
                ,
                server$1: {
                  listen: "443 ssl",
                  server_name: "example.com",
                  ssl_protocols: "TLSv1 TLSv1.1 TLSv1.2",
                  ssl_ciphers: `EECDH+AESGCM:EDH+AESGCM:ECDHE-RSA-AES128-GCM-SHA256:AES256+EECDH:DHE-RSA-AES128-GCM-SHA256:AES256+EDH:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4`,
                  ssl_prefer_server_ciphers: true,
                  ssl_session_cache: "shared:SSL:10m",
                  ssl_session_timeout: "10m",
                  ssl_certificate: "/etc/ssl/certs/key.chained.com",
                  ssl_certificate_key: "/etc/ssl/certs/private-key.key",
                  access_log: "/log/example.com.access.log",
                  error_log: "/log/example.error.log",
                  charset: "utf-8",
                  server_tokens: false,
                  root: "/public",
                  "location$@node": {
                        proxy_pass: "http://node_servers",
                        proxy_set_header: "Host $host",
                        proxy_set_header: "X-Real-IP $remote_addr",
                        proxy_set_header: "X-Forwarded-For $proxy_add_x_forwarded_for",
                  },
                  "location$/": {
                        etag: true,
                        sendfile: true,
                        index: "index.html",
                        try_files: "$uri $uri/ @node"
                  }
                },
                server$2: {
                  listen: "80 default_server",
                  listen$1: "[::]:80 default_server",
                  server_name: "example.com",
                  server_tokens: "off",
                  return: "301 https://$host$request_uri"
                }}
            </File>
            "COPY docker/nginx/certs /etc/ssl/certs",
            "VOLUME /public",
            "VOLUME /log"
          ]}
      />  
      <Service name="node">
        <Container
          from="node:8"
          steps={`RUN apt-get update
  COPY ./express /express
  COPY ./start.sh /start.sh
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
  RUN chmod +x /start.sh`}
          command={"/start.sh"}
        />    
      </Service>
    </Service>
  </Composition>
</Project>
```

## Licence

MIT
