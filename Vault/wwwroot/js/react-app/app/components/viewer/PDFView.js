﻿import React from 'react';
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";

import styles from '../../App.css';

class PDFView extends React.Component {
    constructor(props)
    {
        super(props);

        this.pdf = null;
        this.pages = 0;
        this.currentPage = 0;

        this.state = {
            isLoading: true
        };
    }

    componentDidMount()
    {
        // Setup a constant...
        const view = this.props.view;

        // Setup our url...
        const url = `${view.relativeURL}${view.url}`;

        // Setup our worker path...
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

        // Attempt to get the document...
        pdfjs.getDocument(url).then((pdf) =>
        {
            // Setup our PDF instance...
            this.pdf = pdf;

            // Set the number of pages... (limit at 20...)
            this.pages = pdf.numPages > 20 ? 20 : pdf.numPages;

            //Start with first page
            pdf.getPage(1).then(this.handlePages.bind(this));
        });
    }

    handlePages(page)
    {
        // Setup our scale and viewport...
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        // Create our canvas element...
        const canvas = document.createElement("canvas");
        canvas.style.display = "block";

        // Setup our canvas context...
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render our page to the canvas...
        page.render({ canvasContext: context, viewport: viewport });

        //Add it to the web page
        this.container.appendChild(canvas);

        // Increment our current page...
        this.currentPage++;

        // Check if our PDF is valid and that the current page is within range...
        // Then get the current page...
        if (this.pdf && this.currentPage <= this.pages)
            this.pdf.getPage(this.currentPage).then(this.handlePages.bind(this));
        else
            this.setState({ isLoading: false });
    }

    render() {
        // Check if we we're provided with a prop...
        if (!this.props.view) return null;

        // Setup a constant...
        const view = this.props.view;

        // Return our view...
        return (<>
            <center>
                <div className={styles['loader']} style={{ display: !this.state.isLoading ? "none" : "block" }} />
            </center>

            <div className={styles['overlay-preview']} style={{ display: this.state.isLoading ? "none" : "block" }}
                ref={(ref) => { this.container = ref; }} />
        </>);
    }
}

export default PDFView;