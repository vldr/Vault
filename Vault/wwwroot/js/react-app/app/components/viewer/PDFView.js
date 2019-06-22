import React from 'react';
import pdfjs from "@bundled-es-modules/pdfjs-dist/build/pdf";

import styles from '../../App.css';

class PDFView extends React.Component {
    constructor(props)
    {
        super(props);

        this.pdf = null;
        this.pages = 0;
        this.currentPage = 1;

        this.state = {
            isLoading: true,
            error: null,
            progress: 0
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

        // Setup our loading task by getting the PDF...
        let loadingTask = pdfjs.getDocument(url);

        // Setup a on progress 
        loadingTask.onProgress = (progress) =>
        {
            // Setup our percentage...
            const percent = progress.loaded / progress.total * 100;

            // Update our state according to our progress...
            this.setState({ progress: percent, isLoading: percent < 100  });
        };

        // Setup a promise...
        loadingTask.promise.then((pdf) =>
        {
            // Setup our PDF instance...
            this.pdf = pdf;

            // Set the number of pages... (limit at 20...)
            this.pages = pdf.numPages > 20 ? 20 : pdf.numPages;

            //Start with first page
            pdf.getPage(1).then(this.handlePages.bind(this));
        }).catch(error => this.setState({ error: error }));
    }

    handlePages(page)
    {
        // Check if container still exists...
        if (!this.container) return;

        // Setup our scale and viewport...
        let viewport = page.getViewport(1);

        // Setup our scale to be relative to the size of the image...
        const scale = (document.body.clientWidth * 0.8)/ viewport.width;

        // Overwrite our viewport using the updated scale...
        viewport = page.getViewport({ scale: scale });

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

        // Return our view...
        return (<>
            <div className={styles['load-progress']} style={loaderStyle} />
            {!this.state.isLoading && this.state.error && <div className={styles['overlay-message']}>Unable to preview document...</div>}
            <div className={styles['overlay-preview']} style={{ display: this.state.isLoading && !this.state.error ? "none" : "block" }}
                ref={(ref) => { this.container = ref; }} />
        </>);
    }
}

export default PDFView;