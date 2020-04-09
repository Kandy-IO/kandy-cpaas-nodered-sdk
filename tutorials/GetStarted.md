# Get Started

In this quickstart, we will help you dip your toes in before you dive in. This guide will help you get started with the $KANDY$ Node-RED SDK.

## Using the SDK

To begin, you will need to install the Node-RED library in your application. The library can be installed by using the following ways:

Run the following command in your Node-RED user directory - typically ~/.node-red

```bash
npm install @kandy-io/node-red-contrib-cpaas-sdk
```

Or install it via the `Manage Palette` in the Node-RED dashboard by searching for `@kandy-io/node-red-contrib-cpaas-sdk`

## Configuration
Each node must have `CPaaS Credentials` before using it which are the configuration credentials for the project. The credentials are `Client ID`, `Client secret` and `Base URL`. Once a credential node is created it can be reused in other nodes.

Before starting, you need to learn following information from your CPaaS account, specifically from Developer Portal.

Log into your Developer Portal account and the configuration information required to be authenticated should be under:

+ `Projects` -> `{your project}` -> `Project info`/`Project secret`

> + `Private Project key` should be mapped to `Client ID`
> + `Private Project secret` should be mapped to `Client secret`

`Client ID` -> <Private Project key>
`Client secret` -> <Private Project secret>
`Base URL` -> $KANDYFQDN$

## Usage

### Input

All the nodes can be used in 2 ways.
1. Using the GUI dashboard, the node's interface can be used directly to input the relevant values in the form.
2. The same data can also be passed in `msg.payload` to the input of the node.

Both of the above ways deliver the same result.

### Output
All the input that is sent using `msg.payload` is passed through the node and the output `msg.payload` would have the same data as the input `msg.payload`. Any output that the node produces can be found in `cpaas_response` key of the `msg`.
