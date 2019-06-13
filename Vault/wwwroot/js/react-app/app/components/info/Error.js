import React from 'react';

export class Error extends React.Component
{
    render() {
        return (
            <div id="error-container">
                <div id="error-icon" />
                <div id="error-message">{this.props.message}</div>
            </div>
        );
    }
}