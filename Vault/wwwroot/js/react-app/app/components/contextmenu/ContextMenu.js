import React from 'react';
import AsSingleton from '@peterbee/react-singleton';

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

        // Reset our onclick...
        document.documentElement.onclick = undefined;
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
        const menuStyle = { left: `${this.state.x}px`, top: `${this.state.y}px` };

        // Setup a variable containing our context menu only when it is open...
        const contextMenu = this.state.isOpen ? (<div className="menu" style={menuStyle}>
            <ul className="menu-options">{this.state.options}</ul>
        </div>) : null;

        // Return the context menu...
        return (<>{contextMenu}</>);
    }
}

export default AsSingleton(ContextMenu);