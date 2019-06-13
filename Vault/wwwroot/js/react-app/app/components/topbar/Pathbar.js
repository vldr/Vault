import React from 'react';

export class Pathbar extends React.Component
{
    render() 
    {
        const path = this.props.path;

        return (
            <div id="folder-path">
                {
                    path.map((item, i) =>
                    {
                        return (<span onClick={this.props.gotoFolder.bind(this, item.id)}>{item.name} / </span>)
                    })
                }
            </div>
        );
    }
}