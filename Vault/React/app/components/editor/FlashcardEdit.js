import React from 'react';
import PQueue from 'p-queue';
import styles from '../../app/App.css';
import { ActionAlert } from '../info/ActionAlert';

class FlashcardEdit extends React.Component {
    constructor(props) {
        super(props);

        this.timeout = null;
        this.terms = null;
        this.queue = new PQueue({ concurrency: 1 });

        this.state = {
            isLoading: true,
            indicator: "",
            deck: null, 
            error: null
        };
    }

    componentDidMount()
    {
        this.getDeck();   

        document.documentElement.onkeydown = (event) => {
            //if (event.key === 'ArrowRight') this.nextPage();
            //if (event.key === 'ArrowLeft') this.previousPage();
        }; 
    }

    componentDidUpdate()
    {

    }

    componentWillUnmount()
    {
        document.documentElement.onkeydown = null;

        if (this.timeout) clearTimeout(this.timeout);
    }

    getDeck()
    {
        const view = this.props.view;

        fetch(`${view.relativeURL}${view.url}`,
        {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            }
        })
        .then(res => res.json())
        .then(
            (deck) => this.parseData(deck),
            (error) => this.setState({ error: error.message, flashcardRendered: null, isLoading: false })
        );
    }

    saveData()
    {
        /////////////////////////////////
         
        this.queue.add(() => 
            fetch("process/edittextfile",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `fileid=${encodeURIComponent(this.props.view.id)}`
                    + `&contents=${encodeURIComponent(
                        JSON.stringify(this.state.deck)
                    )}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.success)
                    {
                        this.setState({
                            indicator: `Saved ${this.state.deck.cards.length} terms successfully (${new Date().toLocaleString()}).`,
                            isLoading: false,
                            deck: this.state.deck
                        });
                    }
                    else this.setState({
                        indicator: `Failed to save ${this.state.deck.cards.length} terms.`,
                        isLoading: false,
                        deck: this.state.deck
                    });
                },
                (error) => this.setState({
                    indicator: `Failed to save ${this.state.deck.cards.length} terms (connection issue), the flashcards were saved locally.`,
                    isLoading: false,
                    deck: this.state.deck
                })
            )
        ); 
    }

    parseData(deck)
    {
        const hasCards = "cards" in deck;

        ////////////////////////////////////////

        if (!hasCards)
        {
            deck.cards = [];
            deck.cards.push({ term: "", definition: "" });
        }

        ////////////////////////////////////////

        const cachedDeck = window.localStorage.getItem(`deck-${this.props.view.id}`);
        const shouldUseCache = cachedDeck && cachedDeck !== JSON.stringify(deck);

        ////////////////////////////////////////

        this.setState({
            indicator: shouldUseCache ? `Successfully recovered flashcards from the previous session.`
                : `Successfully loaded ${deck.cards.length} terms.`,
            deck: shouldUseCache ? JSON.parse(cachedDeck) : deck,
            error: null,
            isLoading: false
        });
    }

    updateTerm(event, index)
    {
        if (this.timeout) clearTimeout(this.timeout);

        ////////////////////////////////////////

        this.state.deck.cards[index].term = event.currentTarget.innerText;

        ////////////////////////////////////////

        window.localStorage.setItem(`deck-${this.props.view.id}`,
            JSON.stringify(
                this.state.deck
            )
        );

        ////////////////////////////////////////

        this.timeout = setTimeout(() => this.saveData(), 700);
    }

    updateDefinition(event, index) {
        if (this.timeout) clearTimeout(this.timeout);

        ////////////////////////////////////////

        this.state.deck.cards[index].definition = event.currentTarget.innerText;

        ////////////////////////////////////////

        window.localStorage.setItem(`deck-${this.props.view.id}`,
            JSON.stringify(
                this.state.deck
            )
        );

        ////////////////////////////////////////

        this.timeout = setTimeout(() => this.saveData(), 700);
    }

    addNewTerm() {
        this.state.deck.cards = this.state.deck
            .cards.filter(a => a.term.length !== 0 || a.definition.length !== 0);

        ////////////////////////////////////////

        this.terms = null;

        ////////////////////////////////////////

        this.state.deck.cards.push({ term: "", definition: "" });

        ////////////////////////////////////////

        this.setState({
            deck: this.state.deck
        });
    }

    render() {
        if (!this.props.view) return null;

        ////////////////////////////////////////

        if (this.state.error)
            return <div className={styles['overlay-message']}>Unable to edit flashcards: {this.state.error}.</div>;

        ////////////////////////////////////////

        const view = this.props.view;

        ////////////////////////////////////////

        const loaderStyle = {
            display: !this.state.isLoading ? "none" : "block"
        };

        ////////////////////////////////////////

        const overlayStyle = {
            display: this.state.isLoading ? "none" : "block",
            textAlign: "center"
        };

        ////////////////////////////////////////

        if (!this.state.isLoading && !this.terms && this.state.deck)
        {
            this.terms = this.state.deck.cards.map((card, index) => (
                <div className={styles['flashcard']} key={index}>
                    <h5 className={styles['flashcard-title']}>{index + 1}</h5>
                    <div className={styles['flashcard-wrapper']}>
                        <div>
                            <div className={styles['flashcard-input']} contentEditable suppressContentEditableWarning
                                onInput={(e) => this.updateTerm(e, index)}>
                                {card.term}
                            </div>
                            <span className={styles['flashcard-subtitle']}>TERM</span>
                        </div>
                        <div>
                            <div className={styles['flashcard-input']} contentEditable suppressContentEditableWarning
                                onInput={(e) => this.updateDefinition(e, index)}>
                                {card.definition}
                            </div>
                            <span className={styles['flashcard-subtitle']}>DEFINITION</span>
                        </div>
                    </div>
                </div>
                )
            );
        }

        ////////////////////////////////////////

        const addNewTermButton = !this.state.isLoading && this.state.deck ?
            (<div className={styles['flashcard-add-button']} onClick={this.addNewTerm.bind(this)}>
                <div className={styles['flashcard-add-button-title']}>
                    <span className={styles['flashcard-add-button-plus']}>{this.state.deck.cards.length + 1}</span>
                    <span className={styles['flashcard-add-button-text']}>ADD CARD</span>                   
                </div>
            </div>) : null;

        ////////////////////////////////////////

        const indicator = !this.state.isLoading && this.state.deck ?
            (<p className={styles['flashcard-indicator-text']}>
                {this.state.indicator}
            </p>) : null;

        ////////////////////////////////////////

        return (<>
            <center>
                <div className={styles['loader']} style={loaderStyle} />
            </center>

            <div style={overlayStyle}>
                {indicator}
                {this.terms}
                {addNewTermButton}
            </div>
        </>);
    }
}

export default FlashcardEdit;