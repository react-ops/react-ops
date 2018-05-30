import * as React from "react";

const formatKey = key => {
    const parts = key.split("$");
    if (key.length > 1) {
        if (!isNaN(parts[1])) {
            return parts[0];
        }
        return parts.join(" ");
    }
    return key;
}

const formatValue = value => {
    switch(typeof value) {
        case "boolean": 
            return !!value ? "on" : "off";
        case "string":
        case "number":
            return String(value);
        default:
            if (Array.isArray(value)) {
                return value.join(" ");
            }
            return "{\n" + format(value) + "\n}\n";
    }
}
    

const format = data => Object
    .keys(data)
    .map(key => formatKey(key) + " " + formatValue(data[key]))
    .join("\n")

export const NginxConf = (props: any & Readonly<{ children?: React.ReactNode }>) =>
{
    return Array.isArray(props.children)
        ? props.children.map(child => format(child)).join("\n")
        : format(props.children);

}
