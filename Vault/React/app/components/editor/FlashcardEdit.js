﻿import React from 'react';
import fossilDelta from 'fossil-delta';
import PQueue from 'p-queue';
import styles from '../../app/App.css';
import { ActionAlert } from '../info/ActionAlert';
import { DeleteFlashcard } from '../action/DeleteFlashcard';
import { StringDecoder } from 'string_decoder';

class FlashcardEdit extends React.Component {
    constructor(props) {
        super(props);

        this.timeout = null;
        this.terms = null;
        this.termsRendered = [];
        this.queue = new PQueue({ concurrency: 1 });

        this.previousDeck = null;

        this.state = {
            isLoading: true,
            indicator: "",

            deck: null, 
            deckStyles: [],
            hoverIndex: -1, 

            definitionSuggestions: [],
            termSuggestions: [],

            error: null
        };
    }

    componentDidMount()
    {
        this.getDeck();   

        document.documentElement.onkeydown = (event) => {
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
            (error) => this.setState({ error: error.message, deck: null, isLoading: false })
        );
    }

    parseData(deck)
    {
        this.previousDeck = JSON.parse(
            JSON.stringify(
                deck
            )
        );

        ////////////////////////////////////////

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

    saveData()
    {
        this.queue.add(() =>
        {
            const decodeUTF8 = (s) => {
                var i, d = unescape(encodeURIComponent(s)), b = new Array(d.length);
                for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
                return b;
            };

            const encodeUTF8 = (arr) => {
                var i, s = [];
                for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
                return decodeURIComponent(escape(s.join('')));
            };

            ////////////////////////////////////////

            const target = decodeUTF8(
                JSON.stringify(
                    this.state.deck
                )
            );

            const origin = decodeUTF8(
                JSON.stringify(
                    this.previousDeck
                )
            );

            const delta = fossilDelta.create(origin, target);

            ////////////////////////////////////////

            return Promise.resolve(
                fetch("process/edittextfile",
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `fileid=${encodeURIComponent(this.props.view.id)}`
                        + `&contents=${encodeURIComponent(
                            encodeUTF8(delta)
                        )}`
                })
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result.success) {
                            this.previousDeck = JSON.parse(
                                encodeUTF8(
                                    fossilDelta.apply(
                                        origin,
                                        delta
                                    )
                                )
                            );

                            ////////////////////////////////////

                            this.setState({
                                indicator: `Saved ${this.state.deck.cards.length} terms successfully (${new Date().toLocaleString()}).`,
                                isLoading: false,
                                deck: this.state.deck,
                                deckStyles: this.state.deckStyles 
                            });
                        }
                        else this.setState({
                            indicator: `Failed to save ${this.state.deck.cards.length} terms.`,
                            isLoading: false,
                            deck: this.state.deck,
                            deckStyles: this.state.deckStyles
                        });
                    },
                    (error) => this.setState({
                        indicator: `Failed to save ${this.state.deck.cards.length} terms (connection issue), the flashcards were saved locally.`,
                        isLoading: false,
                        deck: this.state.deck,
                        deckStyles: this.state.deckStyles 
                    })
                )
            );
        });
    }

    addCard(index)
    {
        ////////////////////////////////////////

        this.terms = null; 

        ////////////////////////////////////////

        console.log(index);

        if (index !== null)
            this.state.deck.cards.splice(index, 0, { term: "", definition: "" });
        else
            index = this.state.deck.cards.push({ term: "", definition: "" }) - 1;

        ////////////////////////////////////////

        this.state.deckStyles[index] = { animation: "fadein 0.4s ease-out forwards" };

        this.setState({
            deck: this.state.deck,
            deckStyles: this.state.deckStyles,
        });

        ////////////////////////////////////////

        this.timeout = setTimeout(() => {
            this.terms = null;
            this.state.deckStyles[index] = { };
            this.setState({
                deckStyles: this.state.deckStyles
            });
        }, 700);
    }

    deleteCard(index)
    {
        ////////////////////////////////////////

        this.terms = null;

        this.state.deckStyles[index] = { opacity: "0" };

        this.setState({
            deckStyles: this.state.deckStyles,
        });

        ////////////////////////////////////////

        this.timeout = setTimeout(() =>
        {
            this.state.deck.cards.splice(index, 1);

            ////////////////////////////////////////

            window.localStorage.setItem(`deck-${this.props.view.id}`,
                JSON.stringify(
                    this.state.deck
                )
            );

            ////////////////////////////////////////

            this.terms = null;
            this.state.deckStyles[index] = {};

            ////////////////////////////////////////

            this.saveData();
        }, 200);        
    }

    moveCard(start, end)
    {
        const spacing = 25;
        const endHeight = this.termsRendered[end].offsetHeight + spacing;
        const startHeight = this.termsRendered[start].offsetHeight + spacing;

        ////////////////////////////////////////

        const distance = Math.abs(start - end);

        ////////////////////////////////////////

        if (distance > 1)
        {
            this.state.deckStyles[end] = { opacity: "0" };
            this.state.deckStyles[start] = { opacity: "0" };
        }
        else
        {
            this.state.deckStyles[end] = { position: "relative", top: `${end < start ? startHeight : -startHeight}px` };
            this.state.deckStyles[start] = { position: "relative", top: `${end < start ? -endHeight : endHeight}px` };
        }

        ////////////////////////////////////////

        this.terms = null;
        this.setState({ deckStyles: this.state.deckStyles });

        setTimeout(() => {
            ////////////////////////////////////////

            const cache = this.state.deck.cards[start];

            this.state.deck.cards[start] = this.state.deck.cards[end];
            this.state.deck.cards[end] = cache;

            ////////////////////////////////////////

            window.localStorage.setItem(`deck-${this.props.view.id}`,
                JSON.stringify(
                    this.state.deck
                )
            );

            ////////////////////////////////////////

            this.terms = null;

            ////////////////////////////////////////

            this.state.deckStyles[end] = { };
            this.state.deckStyles[start] = { };
            this.saveData();
        }, 200);
    }

    setCardIndex(event, index)
    {
        if (event.key !== 'Enter') return;

        /////////////////////////////////////

        if (event.target.innerText.length === 0) {
            event.target.blur();
            event.target.innerText = index + 1;
            return;
        }

        /////////////////////////////////////

        const end = Number(event.target.innerText) - 1;

        /////////////////////////////////////

        if (isNaN(end)) {
            event.target.blur();
            event.target.innerText = index + 1;
            return;
        }

        /////////////////////////////////////

        if (end > this.state.deck.cards.length || end < 0 || end === index) {
            event.target.blur();
            event.target.innerText = index + 1;
            return;
        }

        /////////////////////////////////////

        event.target.blur(); 

        this.moveCard(index, end);
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
    
        this.timeout = setTimeout(() =>
        {
            this.getSuggestions(this.state.deck.cards[index].term);
            this.saveData();
        }, 500);
    }

    updateDefinition(event, index)
    {
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

        this.timeout = setTimeout(() => this.saveData(), 500);
    }

    toggleHover(index)
    {
        this.terms = null;
        this.setState({ hoverIndex: index });
    }

    getTermSuggestions(term)
    {
        fetch(`https://cors-anywhere.herokuapp.com/`
            + `https://quizlet.com/webapi/3.2/suggestions/definition?clientId=&limit=3`
            + `&word=${encodeURIComponent(term)}&defLang=en&localTermId=-1&prefix=&wordLang=en`)
            .then((result) => result.json())
            .then((result) => console.log(result));
    }

    render()
    {
        if (!this.props.view) return null;

        ////////////////////////////////////////

        if (this.state.error)
            return <div className={styles['overlay-message']}>Unable to edit flashcards: {this.state.error}.</div>;

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
            this.termsRendered = [];
            this.terms = this.state.deck.cards.map((card, index) => (<div key={index}>
                <div className={styles['flashcard-seperator']}
                    onMouseEnter={this.toggleHover.bind(this, index)}
                    onMouseLeave={this.toggleHover.bind(this, -1)}>
                    <div className={styles['flashcard-seperator-add']}
                        onClick={this.addCard.bind(this, index)}
                        style={this.state.hoverIndex === index ? { height: "48px", width: "48px" } : {}} />
                </div>
                <div className={styles['flashcard']}
                    style={this.state.deckStyles[index]}
                    ref={(ref) => { this.termsRendered[index] = ref; }}>

                    <div className={styles['flashcard-delete-button']}
                        onClick={() => new ActionAlert(<DeleteFlashcard deleteCard={this.deleteCard.bind(this)} index={index} />)}
                    />
                    <div className={styles['flashcard-up-button']}
                        style={index === 0 ? { opacity: "0.2", pointerEvents: "none"} : {}}
                        onClick={this.moveCard.bind(this, index, index - 1)} 
                    />
                    <div className={styles['flashcard-down-button']}
                        style={index + 1 === this.state.deck.cards.length ? { opacity: "0.2", pointerEvents: "none"} : {}}
                        onClick={this.moveCard.bind(this, index, index + 1)} 
                    />
                    <h5 className={styles['flashcard-title']} contentEditable suppressContentEditableWarning
                        onBlur={(e) => e.currentTarget.innerText = index + 1}
                        onKeyDown={(e) => this.setCardIndex(e, index)}>
                        {index + 1}
                    </h5>
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
            </div>)
            );
        }

        ////////////////////////////////////////

        const addNewTermButton = !this.state.isLoading && this.state.deck ?
            (<div className={styles['flashcard-add-button']} onClick={this.addCard.bind(this, null)}>
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