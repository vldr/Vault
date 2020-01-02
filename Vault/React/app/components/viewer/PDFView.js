import React from 'react';
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";

import styles from '../../app/App.css';

class PDFView extends React.Component {
    constructor(props) {
        super(props);

        this.pdf = null;
        this.maxPage = 0;
        this.page = 0;
        this.viewport = null;

        this.state = {
            isLoading: true,
            error: null
        };
    }

    componentDidMount() {
        // Setup a constant...
        const view = this.props.view;

        // Setup our url...
        const url = `${view.relativeURL}${view.url}`;

        // Setup our worker path...
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

        // Setup our loading task by getting the PDF...
        let loadingTask = pdfjs.getDocument(url);

        // Setup a promise...
        loadingTask.promise.then((pdf) => {
            // Setup our PDF instance...
            this.pdf = pdf;

            // Set the number of pages...
            this.maxPage = pdf.numPages;

            // Start with first page...
            this.handleNextPage();
        }).catch(error => this.setState({ isLoading: false, error: error }));
    }

    handleCanvas(page) {
        // Check if container still exists...
        if (!this.canvas) return;

        this.setState({ isLoading: true });

        // Setup our scale to be relative to the size of the image...
        const scale = 5;

        // Setup our scale and viewport...
        this.viewport = page.getViewport(scale);

        // Setup our canvas context...
        const context = this.canvas.getContext('2d');
        this.canvas.height = this.viewport.height;
        this.canvas.width = this.viewport.width;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        // Render our page to the canvas...
        page.render({ canvasContext: context, viewport: this.viewport })
            .then(() => this.setState({ isLoading: false }) )
            .catch(error => this.setState({ isLoading: false }) );

    }

    handleTextContent(textContent) {
        // Check if container still exists...
        if (!this.textContainer) return;

        // Setup our canvas context...
        this.textContainer.style.left = this.viewport.left + "px";
        this.textContainer.style.top = this.viewport.top + "px";
        this.textContainer.style.height = this.viewport.height + "px";
        this.textContainer.style.width = this.viewport.width + "px";

        // Render our text to the container...
        pdfjs.renderTextLayer({
            textContent: textContent,
            container: this.textContainer,
            viewport: this.viewport,
            textDivs: []
        });     
    }

    handleNextPage()
    {
        // Check if we've reached max page...
        if (this.page === this.maxPage) return;

        // Increment our current page...
        this.page += 1;

        // Get the page...
        this.pdf.getPage(this.page)
            .then(this.handleCanvas.bind(this))
            .catch(error => this.setState({ error: error }));
    }

    handlePreviousPage()
    {
        // Check if we've reached last page...
        if (this.page === 1) return;

        // Increment our current page...
        this.page -= 1;

        // Get the page...
        this.pdf.getPage(this.page)
            .then(this.handleCanvas.bind(this))
            .catch(error => this.setState({ error: error }));
    }

    nextPage()
    {
        // Check if we're loading...
        if (this.state.isLoading) return;

        // Call our handler...
        this.handleNextPage();
    }

    previousPage()
    {
        // Check if we're loading...
        if (this.state.isLoading) return;

        // Call our handler...
        this.handlePreviousPage();
    }

    render() {
        // Check if we we're provided with a prop...
        if (!this.props.view) return null;

        // Setup a constant...
        const view = this.props.view;

        // Setup our loader style...
        const loaderStyle = {
            width: `${this.state.progress}%`,
            display: !this.state.isLoading ? "none" : "block"
        };

        // Setup our overlay style...
        const overlayStyle = {
            display: this.state.isLoading ? "none" : "block",
            textAlign: "center"
        };

        // Return our view...
        return (<>
            <center>
                <div className={styles['loader']} style={loaderStyle} />
            </center>

            <div className={styles['overlay-preview']} style={overlayStyle} ref={(ref) => { this.wrapper = ref; }} >
                <canvas height="0" width="0" ref={(ref) => { this.canvas = ref; }} />
            </div>

            {!this.state.isLoading && this.state.error && <div className={styles['overlay-message']}>Unable to preview document...</div>}

            <div className={styles['page-select']}>
                {this.page > 1 && <button onClick={this.previousPage.bind(this)}>Back</button>}

                <button disabled>
                    <span>{this.page} </span>
                    / {this.maxPage}</button>

                {this.page < this.maxPage && <button onClick={this.nextPage.bind(this)}>Next</button>}
            </div>
        </>);
    }
}

export default PDFView;