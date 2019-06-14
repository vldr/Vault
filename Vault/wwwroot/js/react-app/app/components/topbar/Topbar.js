import React from 'react';

export class Topbar extends React.Component
{
    

    render() {
        return (
            <div id="topbar">
                <span className="logo">
                    <img src="images/ui/logo.svg" />
                </span>

                <div className="btnSettings" />
                <div className="btnLogout" />
                <div className="btnHelp" />
                <div className="btnSort" />
                <div className="btnUpload"  />

                <div className="topbar-hider" />
            </div>
        );
    }
}