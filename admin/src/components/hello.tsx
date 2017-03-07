import * as React from 'react';

export interface HelloProps {
    compiler: string;
    framework: string;
}

export class Hello extends React.Component<HelloProps, undefined> {
    render() {
        return <h1>Game server - {this.props.compiler}, {this.props.framework}</h1>;
    }
}
