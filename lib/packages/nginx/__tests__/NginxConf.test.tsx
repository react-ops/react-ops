import "jest";
import * as React from "react";
import * as path from "path";
import {
    NginxConf,
} from "../NginxConf";
import {
    ReactOps
} from "../../../ReactOps";
import {
    IReactOpsElement,
    IReactOpsProps
} from "../../../index.d"

describe("lib/packages/nginx/NginxConf", () => {

    it("Renders proper output", async () => {

        const nodesCount = 5;

        expect(ReactOps.cleanup(await ReactOps.render(
            <NginxConf>
                {{
                    "upstream$node_servers": Array.apply(null, Array(nodesCount))
                        .map((_, index) => 3000 + index)
                        .reduce((p, c) => {
                            p["server$" + c] = "nodejs:" + c;
                            return p
                        }, { ip_hash: "" })
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
                            proxy_set_header$1: "X-Real-IP $remote_addr",
                            proxy_set_header$2: "X-Forwarded-For $proxy_add_x_forwarded_for",
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
                    }
                }}
            </NginxConf>,
            __dirname, {
                $dry: true
            }
        )))
        .toEqual("upstream node_servers {\nip_hash \nserver nodejs:3000\nserver nodejs:3001\nserver nodejs:3002\nserver nodejs:3003\nserver nodejs:3004\n}\n\nserver {\nlisten 443 ssl\nserver_name example.com\nssl_protocols TLSv1 TLSv1.1 TLSv1.2\nssl_ciphers EECDH+AESGCM:EDH+AESGCM:ECDHE-RSA-AES128-GCM-SHA256:AES256+EECDH:DHE-RSA-AES128-GCM-SHA256:AES256+EDH:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4\nssl_prefer_server_ciphers on\nssl_session_cache shared:SSL:10m\nssl_session_timeout 10m\nssl_certificate /etc/ssl/certs/key.chained.com\nssl_certificate_key /etc/ssl/certs/private-key.key\naccess_log /log/example.com.access.log\nerror_log /log/example.error.log\ncharset utf-8\nserver_tokens off\nroot /public\nlocation @node {\nproxy_pass http://node_servers\nproxy_set_header Host $host\nproxy_set_header X-Real-IP $remote_addr\nproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for\n}\n\nlocation / {\netag on\nsendfile on\nindex index.html\ntry_files $uri $uri/ @node\n}\n\n}\n\nserver {\nlisten 80 default_server\nlisten [::]:80 default_server\nserver_name example.com\nserver_tokens off\nreturn 301 https://$host$request_uri\n}\n")


    });

});
