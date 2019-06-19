import React from 'react';

export class Error extends React.Component
{
    render() {
        return (
            <div>{this.props.message}</div>
        );
    }
}