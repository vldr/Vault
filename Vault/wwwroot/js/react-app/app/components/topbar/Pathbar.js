import React from 'react';

export class Pathbar extends React.Component
{
    render() 
    {
        return (
            <div id="folder-path">{this.props.path}</div>
        );
    }
}