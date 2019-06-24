/*
    MIT License

    Copyright (c) 2017 Peter A. Hollingsworth

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */
import React from 'react';
import PropTypes from 'prop-types';

export class DropTarget extends React.Component {
    constructor(props) {
        super(props);
        this.elem = null;
        this.state = { highlighted: false };
    }

    componentDidMount() {
        this.elem.addEventListener(`${this.props.targetKey}DragEnter`, this.handleDragEnter.bind(this), false);
        this.elem.addEventListener(`${this.props.targetKey}DragLeave`, this.handleDragLeave.bind(this), false);
        this.elem.addEventListener(`${this.props.targetKey}Drop`, this.handleDrop.bind(this), false);
    }

    createEvent(eventName, eventData) {
        // utility to create an event
        let e;
        if (typeof window.CustomEvent !== 'function') {
            // we are in IE 11 and must use old-style method of creating event
            e = document.createEvent('CustomEvent');
            e.initCustomEvent(eventName, true, true, {});
        } else {
            e = new CustomEvent(eventName, { bubbles: true, cancelable: true });
        }
        Object.assign(e, eventData);
        return e;
    }

    handleDrop(e) {
        // tell the drop source about the drop, then do the callback
        const evt = this.createEvent(
            `${this.props.targetKey}Dropped`,
            {
                dragData: e.dragData,
                dropElem: this.elem,
                dropData: this.props.dropData
            },
        );
        e.containerElem.dispatchEvent(evt);
        this.props.onHit(e);
        this.setState({ highlighted: false });
    }

    handleDragEnter(e) {
        const _e = e;
        this.props.highlightClassName && this.setState({ highlighted: true });
        this.props.onDragEnter(_e);
    }

    handleDragLeave(e) {
        const _e = e;
        this.props.highlightClassName && this.setState({ highlighted: false });
        this.props.onDragLeave(_e);
    }


    render() {
        return (
            <div ref={(t) => { this.elem = t; }}>
                {this.props.render ? this.props.render() : this.props.children}
            </div>
        );
    }
}

DropTarget.propTypes = {
    children: PropTypes.node,
    render: PropTypes.func,
    highlightClassName: PropTypes.string,

    // needs to match the targetKey in the DragDropContainer -- matched via the enter/leave/drop event names, above
    targetKey: PropTypes.string,

    // data that gets sent back to the DragDropContainer and shows up in its onDrop() callback event
    dropData: PropTypes.object,

    // callbacks
    onDragEnter: PropTypes.func,
    onDragLeave: PropTypes.func,
    onHit: PropTypes.func,
};

DropTarget.defaultProps = {
    children: null,
    targetKey: 'ddc',
    onDragEnter: () => { },
    onDragLeave: () => { },
    onHit: () => () => { },
    dropData: {},
    highlightClassName: 'highlighted',
    render: null,
};
