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
import styles from '../../App.css';

export class DragDropContainer extends React.Component {

    constructor(props) {
        super(props);

        // Setup our state...
        this.state = {
            leftOffset: 0,
            topOffset: 0,
            left: 0,
            top: 0,
            clicked: false,
            dragging: false
        };

        // The DOM elements we're dragging, and the elements we're dragging over.
        this.dragElem = null;
        this.containerElem = null;
        this.sourceElem = null;
        this.currentTarget = null;
        this.prevTarget = null;

        // If we're mounted.
        this._isMounted = true;

        // Offset factors that occur when dragging in a zoomed-in IOS browser
        this.fixedOffsetLeft = 0;
        this.fixedOffsetTop = 0;

        // Scroll timer and the scroll position...
        this.scrollTimer = null;
        this.xScroll = 0;
        this.yScroll = 0;

        // Our timeouts for touch...
        this.dragTimeout = null;
        this.contextMenuTimeout = null;
    }

    /**
     * When we mount modify images draggable and set listeners...
     */
    componentDidMount() {
        // Get all image elements...
        const imgs = this.containerElem.getElementsByTagName('IMG');

        // Set draggable attribute 'false' on any images, to prevent conflicts w browser native dragging...
        for (let i = 0; i < imgs.length; i += 1) imgs[i].setAttribute('draggable', 'false');

        // Capture events
        this.addListeners(this.containerElem);
    }

    /** 
     * Update our mounted variable...
     */
    componentWillUnmount() {
        this._isMounted = false;
    }

    /**
     * Check if we're left clicking...
     * @param {any} e Event
     * @returns {Boolean} True/False
     */
    usesLeftButton(e) {
        const button = e.buttons || e.which || e.button;
        return button === 1;
    }

    /**
     * Check if we're trying to open the context menu...
     * @param {any} e Event
     * @returns {Boolean} True/False
     */
    usesRightButton(e) {
        const button = e.buttons || e.which || e.button;
        return button === 2 || button === 3;
    }

    getFixedOffset() {
        // When browser window is zoomed, IOS browsers will offset "location:fixed" component coordinates
        // from the actual window coordinates
        let fixedElem = document.createElement('div');
        fixedElem.style.cssText = 'position:fixed; top: 0; left: 0';
        document.body.appendChild(fixedElem);
        const rect = fixedElem.getBoundingClientRect();
        document.body.removeChild(fixedElem);

        return [rect.left, rect.top];
    }

    /**
     * Check if we're zooming... 
     */
    isZoomed() {
        // Somewhat arbitrary figure to decide whether we need to use getFixedOffset (above) or not...
        return Math.abs(1 - (document.body.clientWidth / window.innerWidth)) > 0.02;
    }

    /**
     * Set our mouse and touch listeners...
     * @param {any} elem The element...
     */
    addListeners(elem) {
        elem.addEventListener('mousedown', (e) => { this.handleMouseDown(e); }, false);
        
        elem.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        elem.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        elem.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    /**
     * Build a custom event...
     * @param {any} eventName The name of the event name...
     * @param {any} extraData Any extra data to store...
     * @returns {CustomEvent} customEvent The custom event...
     */
    buildCustomEvent(eventName, extraData = {})
    {
        let e;

        if (typeof window.CustomEvent !== 'function')
        {
            // we are in IE 11 and must use old-style method of creating event
            e = document.createEvent('CustomEvent');
            e.initCustomEvent(eventName, true, true, {});
        }
        else e = new CustomEvent(eventName, { bubbles: true, cancelable: true });

        // Add useful data to the event...
        Object.assign(e, {
            dragData: this.props.dragData,
            dragElem: this.dragElem,
            containerElem: this.containerElem,
            sourceElem: this.sourceElem
        }, extraData);

        return e;
    }

    setCurrentTarget(x, y) {
        // Drop the z-index to get this elem out of the way, 
        // figure out what we're dragging over, then reset the z index...
        this.dragElem.style.zIndex = -1;

        // Setup a target...
        const target = document.elementFromPoint(x, y) || document.body;

        // Update our z index...
        this.dragElem.style.zIndex = this.props.zIndex;

        // Prevent it from selecting itself as the target
        this.currentTarget = this.dragElem.contains(target) ? document.body : target;
    }

    setFixedOffset() {
        if (this.isZoomed()) {
            [this.fixedOffsetLeft, this.fixedOffsetTop] = this.getFixedOffset();
        }
    }

    doScroll() {
        window.scrollBy(this.xScroll, this.yScroll);
        this.setFixedOffset();
    }

    startScrolling(x, y) {
        [this.xScroll, this.yScroll] = [x, y];
        if (!this.scrollTimer) {
            this.scrollTimer = setInterval(this.doScroll.bind(this), 50);
        }
    }

    stopScrolling() {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
    }

    generateEnterLeaveEvents(x, y) {
        // generate events as we enter and leave elements while dragging
        const prefix = this.props.targetKey;
        this.setCurrentTarget(x, y);
        if (this.currentTarget !== this.prevTarget) {
            if (this.prevTarget) { this.prevTarget.dispatchEvent(this.buildCustomEvent(`${prefix}DragLeave`)); }
            if (this.currentTarget) { this.currentTarget.dispatchEvent(this.buildCustomEvent(`${prefix}DragEnter`)); }
        }
        this.prevTarget = this.currentTarget;
    }

    generateDropEvent(x, y) {
        // generate a drop event in whatever we're currently dragging over
        this.setCurrentTarget(x, y);
        const customEvent = this.buildCustomEvent(`${this.props.targetKey}Drop`, { x, y });
        this.currentTarget.dispatchEvent(customEvent);
    }

    startDrag(clickX, clickY) {
        document.addEventListener(`${this.props.targetKey}Dropped`, this.props.onDrop.bind(this));
        const rect = this.containerElem.getBoundingClientRect();

        this.dragElem.style.display = "block";
        const dragRect = this.dragElem.getBoundingClientRect();
        this.dragElem.style.display = "none";

        this.setState({
            clicked: true,
            leftOffset: -dragRect.width / 2,
            topOffset: -dragRect.height / 2,
            left: clickX - dragRect.width / 2,
            top: clickY - dragRect.height / 2
        });
        this.props.onDragStart(this.props.dragData);
    }

    handleTouchEnd(e)
    {
        // Check if our drag timeout is set and clear it if it is...
        if (this.dragTimeout) clearTimeout(this.dragTimeout);
        if (this.contextMenuTimeout) clearTimeout(this.contextMenuTimeout);

        // Set our clicked state...
        this.setState({ clicked: false });

        // Check if we're dragging and drop our item...
        if (this.state.dragging) this.drop(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }

    handleTouchStart(e)
    {
        // If we aren't dragging return here...
        if (this.props.noDragging) return;

        // Setup our drag timeout...
        this.dragTimeout = setTimeout(() =>
        {
            // Stop propagation...
            e.stopPropagation();
            e.preventDefault();

            this.setFixedOffset();
            this.startDrag(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            this.drag(e.targetTouches[0].clientX, e.targetTouches[0].clientY + 10);
        }, 200);

        // Setup our context menu timeout...
        this.contextMenuTimeout = setTimeout(() => {
            // Stop defaults...
            e.stopPropagation();
            e.preventDefault();

            // Stop dragging...
            this.handleTouchEnd(e);

            // Open our context menu...
            if (this.props.contextMenu) this.props.contextMenu(e);
        }, 1000);
    }

    handleTouchMove(e)
    {
        // If we aren't dragging return here...
        if (this.props.noDragging) return;

        // If our context menu timeout is present clear it...
        if (this.contextMenuTimeout) clearTimeout(this.contextMenuTimeout);

        // Check if we've clicked...
        if (this.state.clicked)
        {
            // Prevent scrolling...
            e.preventDefault();

            // Drag our object...
            this.drag(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        }
        // If we are moving before click then just cancel our timeout...
        else
            // Check if our drag timeout is set and clear it if it is...
            if (this.dragTimeout) clearTimeout(this.dragTimeout);
    }

    getOffscreenCoordinates(x, y) {
        // are we offscreen (or very close, anyway)? if so by how much?
        const LEFTEDGE = 10;
        const RIGHTEDGE = window.innerWidth - 10;
        const TOPEDGE = 10;
        const BOTTOMEDGE = window.innerHeight - 10;
        const xOff = x < LEFTEDGE ? x - LEFTEDGE : x > RIGHTEDGE ? x - RIGHTEDGE : 0;
        const yOff = y < TOPEDGE ? y - TOPEDGE : y > BOTTOMEDGE ? y - BOTTOMEDGE : 0;
        return yOff || xOff ? [xOff, yOff] : false;
    }

    // Start the Drag
    handleMouseDown(e) {
        if (this.usesRightButton(e) && !this.props.noDragging) {
            // Open our context menu...
            if (this.props.contextMenu) this.props.contextMenu(e);
        }

        if (this.usesLeftButton(e) && !this.props.noDragging) {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            this.startDrag(e.clientX, e.clientY);
        }
    }

    // During Drag
    handleMouseMove(e) {
        // If we aren't dragging return here...
        if (this.props.noDragging) return;

        // Prevent our default behaviour...
        e.preventDefault();

        // If we haven't clicked return here...
        if (!this.state.clicked) return;

        this.drag(e.clientX, e.clientY);
        window.getSelection().removeAllRanges(); // prevent firefox native-drag issue when image is highlighted
    }

    // Drop
    handleMouseUp(e) {
        this.setState({ clicked: false });
        if (this.state.dragging) {
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            document.removeEventListener('mouseup', this.handleMouseUp.bind(this));

            this.drop(e.clientX, e.clientY);
            window.getSelection().removeAllRanges(); // prevent weird-looking highlights
        }
    }


    drag(x, y) {
        this.generateEnterLeaveEvents(x, y);
        const stateChanges = { dragging: true };
        const offScreen = this.getOffscreenCoordinates(x, y);
        if (offScreen) {
            this.startScrolling(...offScreen);
        } else {
            this.stopScrolling();
            if (!this.props.yOnly) { stateChanges.left = (this.state.leftOffset + x) - this.fixedOffsetLeft; }
            if (!this.props.xOnly) { stateChanges.top = (this.state.topOffset + y) - this.fixedOffsetTop; }
        }
        this.setState(stateChanges);
        this.props.onDrag(this.props.dragData, this.currentTarget, x, y);
    }

    
    drop(x, y) {
        this.stopScrolling();
        this.generateDropEvent(x, y);
        document.removeEventListener(`${this.props.targetKey}Dropped`, this.props.onDrop);
        this._isMounted && this.setState({ dragging: false });
        this.props.onDragEnd(this.props.dragData, this.currentTarget, x, y);
    }

    getDisplayMode() {
        if (this.state.dragging && !this.props.dragClone) {
            if (this.props.disappearDraggedElement)
            {
                return 'disappeared';
            }

            return 'hidden';
        }
        return 'normal';
    }

    render() {
        const content = this.props.render ? this.props.render(this.state) : this.props.children;
        const displayMode = this.getDisplayMode();

        // Dragging will be applied to the "ghost" element
        const ghostContent = content;

        // Setup ghost styles...
        const ghostStyles = {
            position: 'fixed',
            left: this.state.left,
            top: this.state.top,
            zIndex: this.props.zIndex,
            display: this.state.dragging ? 'block' : 'none'
        };

        // The actual ghost component...
        const ghost = (<div style={ghostStyles} className={styles['drag-ghost']} ref={(c) => { this.dragElem = c; }}>
                {ghostContent}
            </div>);

        // Setup the source elements style...
        const sourceElemStyles = { opacity: displayMode === 'hidden' ? '0.3' : '1' };

        // Return the rendered JSX...
        return (
            <div ref={(c) => { this.containerElem = c; }}>
                <div style={sourceElemStyles} ref={(c) => { this.sourceElem = c; }}>
                    {content}
                </div>
                {ghost}
            </div>
        );
    }
}

DragDropContainer.propTypes = {
    children: PropTypes.node,

    // Determines what you can drop on
    targetKey: PropTypes.string,

    // Makes the dragged element completely disappear while dragging so that it takes up no space
    disappearDraggedElement: PropTypes.bool,

    // If true, then we will drag a clone of the object instead of the object itself. See also customDragElement
    dragClone: PropTypes.bool,

    // ghost will display with this opacity
    dragElemOpacity: PropTypes.number,

    // We will pass this data to the target when you drag or drop over it
    dragData: PropTypes.object,

    // if True, then dragging is turned off
    noDragging: PropTypes.bool,

    // callbacks (optional):
    onDrop: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func,

    // Enable a render prop
    render: PropTypes.func,

    // Constrain dragging to the x or y directions only
    xOnly: PropTypes.bool,
    yOnly: PropTypes.bool,

    // Defaults to 1000 while dragging, but you can customize it if you need it to go higher
    zIndex: PropTypes.number,
};

DragDropContainer.defaultProps = {
    targetKey: 'ddc',
    children: null,
    disappearDraggedElement: false,
    dragClone: false,
    dragElemOpacity: 0.9,
    dragData: {},
    onDragStart: () => { },
    onDrag: () => { },
    onDragEnd: () => { },
    onDrop: () => { },
    noDragging: false,
    render: null,
    xOnly: false,
    yOnly: false,
    zIndex: 1000,
};