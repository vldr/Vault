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
        this.fingerprint = null;

        this.state = {
            isLoading: true,
            gotoPageEnabled: false,
            error: null
        };
    }

    componentDidMount() {
        // Setup a constant.
        const view = this.props.view;

        // Setup our url.
        const url = `${view.relativeURL}${view.url}`;

        // Setup our worker path.
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

        // Setup our loading task by getting the PDF.
        let loadingTask = pdfjs.getDocument(url);

        // Setup a promise.
        loadingTask.promise
            .then((pdf) => {
                // Setup our PDF instance.
                this.pdf = pdf;

                // Set the number of pages.
                this.maxPage = pdf.numPages;

                // Set the fingerprint of the document.
                this.fingerprint = pdf.fingerprint;

                ///////////////////////////////////

                const lastPage = window.localStorage.getItem(`pdf-${this.fingerprint}`);

                ///////////////////////////////////

                if (lastPage)
                { 
                    this.page = Number(lastPage);
                    this.getPage();
                }
                else this.handleNextPage();

                ///////////////////////////////////

                document.documentElement.onkeydown = (event) => {
                    if (event.key === 'ArrowRight') this.nextPage();
                    if (event.key === 'ArrowLeft') this.previousPage();
                };

            })
            .catch(error =>
                this.setState({ isLoading: false, error: error })
            );
    }

    componentDidUpdate()
    {
        if (this.state.gotoPageEnabled) {
            this.gotoPageInput.focus();
            this.gotoPageInput.placeholder = this.page;
        }
    }

    componentWillUnmount() {
        document.documentElement.onkeydown = null;
    }

    handleCanvas(page) {
        // Check if container still exists.
        if (!this.canvas) return;

        this.setState({ isLoading: true });

        // Setup our scale to be relative to the size of the image.
        const scale = 5;

        // Setup our scale and viewport.
        this.viewport = page.getViewport(scale);

        // Setup our canvas context.
        const context = this.canvas.getContext('2d');
        this.canvas.height = this.viewport.height;
        this.canvas.width = this.viewport.width;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        // Render our page to the canvas.
        page.render({ canvasContext: context, viewport: this.viewport })
            .then(() => this.setState({ isLoading: false }) )
            .catch(error => this.setState({ isLoading: false }) );

    }

    handleTextContent(textContent) {
        // Check if container still exists.
        if (!this.textContainer) return;

        // Setup our canvas context.
        this.textContainer.style.left = this.viewport.left + "px";
        this.textContainer.style.top = this.viewport.top + "px";
        this.textContainer.style.height = this.viewport.height + "px";
        this.textContainer.style.width = this.viewport.width + "px";

        // Render our text to the container.
        pdfjs.renderTextLayer({
            textContent: textContent,
            container: this.textContainer,
            viewport: this.viewport,
            textDivs: []
        });     
    }

    getPage()
    {
        window.localStorage.setItem(`pdf-${this.fingerprint}`, this.page);

        /////////////////////////////////////

        this.pdf.getPage(this.page)
            .then(this.handleCanvas.bind(this))
            .catch(error => this.setState({ error: error }));
    }

    handleNextPage()
    {
        // Check if we've reached last page.
        if (this.page === this.maxPage) return;

        /////////////////////////////////////

        this.page += 1;

        /////////////////////////////////////

        this.getPage();
    }

    handlePreviousPage()
    {
        // Check if we've reached last page.
        if (this.page === 1) return;

        /////////////////////////////////////

        this.page -= 1;

        /////////////////////////////////////

        this.getPage();
    }

    nextPage()
    {
        // Check if we're loading.
        if (this.state.isLoading) return;

        // Call our handler.
        this.handleNextPage();
    }

    previousPage()
    {
        // Check if we're loading.
        if (this.state.isLoading) return;

        // Call our handler.
        this.handlePreviousPage();
    }

    toggleGotoPage()
    {
        this.setState({ gotoPageEnabled: !this.state.gotoPageEnabled });
    }

    gotoPageKeyDown(event)
    {      
        if (event.key !== 'Enter') return;

        /////////////////////////////////////
        
        if (event.target.value.length === 0)
        {
            this.toggleGotoPage();
            return;
        }

        /////////////////////////////////////

        const pageNumber = Number(event.target.value);

        /////////////////////////////////////

        if (isNaN(pageNumber))
        {
            this.toggleGotoPage();
            return;
        }

        /////////////////////////////////////

        if (pageNumber > this.maxPage || pageNumber < 1)
        {
            this.toggleGotoPage();
            return;
        }

        /////////////////////////////////////

        this.page = pageNumber;

        /////////////////////////////////////

        this.getPage();

        /////////////////////////////////////

        this.toggleGotoPage(); 
    }

    render() {
        // Check if we we're provided with a prop.
        if (!this.props.view) return null;

        // Setup a constant.
        const view = this.props.view;

        // Setup our loader style.
        const loaderStyle = {
            width: `${this.state.progress}%`,
            display: !this.state.isLoading ? "none" : "block"
        };

        // Setup our overlay style.
        const overlayStyle = {
            display: this.state.isLoading ? "none" : "block",
            textAlign: "center"
        };

        // The goto page input.
        const gotoPageInput = (<input type="text"
            ref={(input) => { this.gotoPageInput = input; }}
            onKeyDown={this.gotoPageKeyDown.bind(this)}
            onBlur={this.toggleGotoPage.bind(this)}
            className={styles['goto-input']}
        />);

        // Return our view.
        return (<>
            <center>
                <div className={styles['loader']} style={loaderStyle} />
            </center>

            <div className={styles['overlay-preview']} style={overlayStyle} ref={(ref) => { this.wrapper = ref; }} >
                <canvas height="0" width="0" ref={(ref) => { this.canvas = ref; }} />
            </div>

            {!this.state.isLoading && this.state.error && <div className={styles['overlay-message']}>Unable to preview document.</div>}

            <div className={styles['page-select']}>
                {this.page > 1 && <button onClick={this.previousPage.bind(this)}>Back</button>}

                <button disabled>
                    {this.state.gotoPageEnabled ? gotoPageInput : <span onClick={this.toggleGotoPage.bind(this)}>{this.page} </span>}
                    / {this.maxPage}</button>

                {this.page < this.maxPage && <button onClick={this.nextPage.bind(this)}>Next</button>}
            </div>
        </>);
    }
}

export default PDFView;