# lwc-server

This is a simple server for local LWC (Lightning Web Components) development

<https://www.npmjs.com/package/lwc-server>

## Installation

```bash
npm install -g lwc-server
```

## Usage

`lwc-server [path to lwc directory] <flags>`

Options
| Flag | Short | Description |
| -------- | -------- | -------- |
| --default   | -d    | Default the path so you can pass myComponent instead of force-app/main/default/lwc/myComponent |

Examples

`lwc-server force-app/main/default/lwc/myComponent`

`lwc-server myComponent --default`

`lwc-server --version`

## Todo

Much. For now this only works for the most basic of LWC.

## Development

todo

---

written by [Jamie Smith](https://jsmith.dev)
