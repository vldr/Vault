import React from 'react';
import AsSingleton from '@vldr/react-singleton';

import styles from '../../app/App.css';

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: null,
            isOpen: false,
            x: 0,
            y: 0,
            ref: null
        };
    }

    /**
     * When our component will be mounted... 
     */
    componentDidMount()
    {
        // Check if our context menu isn't disabled...
        if (this.props.disabled) return;

        // Close our contextmenu when we click on something...
        document.documentElement.onclick = (e) => this.setState({ isOpen: false });

        // Prevent the context menu from opening...
        document.documentElement.oncontextmenu = (e) =>
        {
            if (e.target.className === styles['menu'])
            {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            else
                this.setState({ isOpen: false });
        };

        // Set our state with our reference...
        this.setState({ ref: this.ref });
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
        // Setup our positions...
        let x = event.pageX || event.targetTouches[0].pageX;
        let y = event.pageY || event.targetTouches[0].pageY;

        // Set our state accordingly...
        this.setState({ isOpen: true, options: options });

        // Setup our variables to calculate the difference of the screen vs the position...
        const rect = this.state.ref.getBoundingClientRect();
        const differenceX = window.innerWidth - (x + rect.width);
        const differenceY = window.innerHeight - (y + rect.height);

        // If there is a difference, adjust x and y...
        if (differenceX < 0) x += differenceX;

        // Prevent the default browser action...
        event.preventDefault();

        // Set our state accordingly...
        this.setState({ x: x, y: y });
    }

    render() {
        // Return here if our component is disabled...
        if (this.props.disabled) return null;

        // Setup our menu style...
        const menuStyle = { left: `${this.state.x}px`, top: `${this.state.y}px`, display: this.state.isOpen ? `block` : `none` };

        // Return the context menu...
        return (<div className={styles['menu']} style={menuStyle} ref={(ref) => { this.ref = ref; }}>
            <ul className={styles['menu-options']}>{this.state.options}</ul>
        </div>);
    }
}

export default AsSingleton(ContextMenu);