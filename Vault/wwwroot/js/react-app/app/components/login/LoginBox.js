﻿import React from 'react';
const signalR = require("@aspnet/signalr");

import styles from '../../Login.css';

class LoginBox extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isLoggedIn: false,
            isRegistering: false,
            name: null,
            error: null
        };
    }

    componentDidMount()
    {
        /////////////////////////////////////////////////////
        // SignalR setup...
        /////////////////////////////////////////////////////

        // Setup our signalR connection...
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("notifications")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Capture our update listing command...
        this.connection.on("LoginResponse", (message) =>
        {
            // Check if successful...
            if (!message.success) return;

            // Update our state...
            this.setState({ isLoggedIn: true, name: message.name });
        });

        // Start our connection to our signalr...
        this.connection.start()
            .then(() => {
                // Disable loading...
                this.setState({ isLoading: false });
            })
            .catch((err) => {
                // Disable loading and display an error...
                this.setState({
                    isLoading: false,
                    error: err.toString()
                });
            });
    }

    onOpen() { window.location = "control"; }

    toggleForm(event)
    {
        // Prevent default...
        event.preventDefault();

        // Toggle our state...
        this.setState({ isRegistering: !this.state.isRegistering });
    }

    onRegister(event) {
        // Prevent default...
        event.preventDefault();

        if (!this.rememberMe.checked)
        {
            // Set our loading to true...
            this.setState({ error: "You must accept the terms of service..." });

            // Return here...
            return;
        }

        // Set our loading to true...
        this.setState({ isLoading: true });

        // Attempt to login...
        fetch("register",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `email=${encodeURIComponent(this.username.value)}`
                    + `&password=${encodeURIComponent(this.password.value)}`
                    + `&name=${encodeURIComponent(this.name.value)}`
                    + `&invite=${encodeURIComponent(this.invitekey.checked)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success) {
                        // Set loading to false, and place our error in our state.
                        this.setState({
                            isLoading: false,
                            error: result.reason
                        });
                    }
                    // If we've logged in, redirect...
                    else window.location = "control";
                },
                (error) => {
                    // Set our state to an error...
                    this.setState({
                        isLoading: false,
                        error: error.message
                    });
                }
            );
    }

    onLogin(event)
    {
        // Prevent default...
        event.preventDefault();

        // Set our loading to true...
        this.setState({ isLoading: true });

        // Attempt to login...
        fetch("login",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `email=${encodeURIComponent(this.username.value)}`
                    + `&password=${encodeURIComponent(this.password.value)}`
                    + `&rememberme=${encodeURIComponent(this.rememberMe.checked)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (!result.success)
                    {
                        // Set loading to false, and place our error in our state.
                        this.setState({
                            isLoading: false,
                            error: result.reason
                        });
                    }
                    // If we've logged in, redirect...
                    else window.location = "control";
                },
                (error) => {
                    // Set our state to an error...
                    this.setState({
                        isLoading: false,
                        error: error.message
                    });
                }
            ); 
    }

    render()
    {
        // Setup our loader...
        const loader = this.state.isLoading ? (<img className={styles["cog-wheel"]} src="images/cog.svg" />) : null;

        // Setup our error...
        const error = !this.state.isLoading && this.state.error ? (<p className={styles["error-message"]}>{this.state.error}</p>) : null;

        // Setup our form style...
        const formStyle = {
            display: this.state.isLoading || this.state.isLoggedIn ? "none" : "block"
        };

        // Setup our login form...
        const form = (<form style={formStyle}>
            <input type="text" ref={(input) => { this.username = input; }} onSubmit={this.onLogin.bind(this)} placeholder="Email" />
            <input type="password" ref={(input) => { this.password = input; }} onSubmit={this.onLogin.bind(this)}  placeholder="Password" />

            <label className={styles["remember-checkbox"]}>
                Remember Me<input className={styles["remember-checkbox-input"]} ref={(input) => { this.rememberMe = input; }} type="checkbox" />
                <span className={styles["checkmark"]} />
            </label>

            <button className={styles["button"]} onClick={this.onLogin.bind(this)}>Login</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.toggleForm.bind(this)}>Register</button>
            
        </form>); 

        // Our register form....
        const registerForm = (<form style={formStyle}>
            <input type="text" ref={(input) => { this.username = input; }} onSubmit={this.onRegister.bind(this)} placeholder="Email" />
            <input type="password" ref={(input) => { this.password = input; }} onSubmit={this.onRegister.bind(this)} placeholder="Password" />
            <input type="text" ref={(input) => { this.name = input; }} onSubmit={this.onRegister.bind(this)} placeholder="Name" />

            <hr />

            <input type="password" ref={(input) => { this.invitekey = input; }} onSubmit={this.onRegister.bind(this)} placeholder="Invite Key" />

            <label className={styles["remember-checkbox"]}>
                I accept the terms of service.<input className={styles["remember-checkbox-input"]} ref={(input) => { this.rememberMe = input; }} type="checkbox" />
                <span className={styles["checkmark"]} />
            </label>

            <button className={styles["button"]} onClick={this.onRegister.bind(this)}>Register</button>
            <button className={styles["button"] + " " + styles["inverse"]} onClick={this.toggleForm.bind(this)}>Back</button>
        </form>); 

        // Logged in form...
        const loggedInForm = !this.state.isLoading && this.state.isLoggedIn && (<div className={styles['loggged-in-container']}>
            <h1 className={styles["welcome-title"]}>Hi, {this.state.name}.</h1>
            <button className={styles["welcome-button"]} onClick={this.onOpen.bind(this)}>Open</button>
        </div>);

        // Render our actual login form...
        return (<>
            {loader}
            {error}
            {this.state.isRegistering ? registerForm : form}
            {loggedInForm}
        </>);
    }
}

export default LoginBox;