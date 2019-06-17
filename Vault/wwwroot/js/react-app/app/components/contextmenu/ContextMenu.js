import React from 'react';
import AsSingleton from '@peterbee/react-singleton';

import styles from '../../App.css';

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: null,
            isOpen: false,
            x: 0,
            y: 0
        };
    }

    /**
     * When our component will be mounted... 
     */
    componentDidMount()
    {
        // Setup our onref...
        this.props.onRef(this);

        // Check if our context menu isn't disabled...
        if (this.props.disabled) return;

        // Close our contextmenu when we click on something...
        document.documentElement.onclick = (e) => this.setState({ isOpen: false });
    }

    /**
     * When our component will be unmounted... 
     */
    componentWillUnmount()
    {
        // Reset our onref...
        this.props.onRef(undefined);
    }

    closeMenu()
    {
        this.setState({ isOpen: false });
    }

    /**
     * Toggles the menu on and off...
     * @param {any} event The event containing important mouse locations...
     * @param {any} options The options that someone would want to be rendered...
     */
    toggleMenu(event, options)
    {
        // Prevent the default browser action...
        event.preventDefault();

        // Set our state accordingly...
        this.setState({ x: event.pageX, y: event.pageY, isOpen: true, options: options });
    }

    render()
    {
        // Return here if our component is disabled...
        if (this.props.disabled) return null;

        // Setup our menu style...
        const menuStyle = { left: `${this.state.x}px`, top: `${this.state.y}px`, display: this.state.isOpen ? `block` : `none` };

        // Return the context menu...
        return (<div className={styles['menu']} style={menuStyle}>
            <ul className={styles['menu-options']}>{this.state.options}</ul>
        </div>);
    }
}

export default AsSingleton(ContextMenu);