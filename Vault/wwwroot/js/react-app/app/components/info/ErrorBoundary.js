import React from 'react';
import styles from '../../App.css';

export class ErrorBoundary extends React.Component {
    static getDerivedStateFromError(error)
    {
        return { hasError: true, error: error };
    }

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            hasError: false
        };
    }

    componentDidCatch(error, info) { console.error(info.componentStack); }

    render()
    {
        if (this.state.hasError)
        {
            return (
                <div className={styles['error-boundary']}>
                    <img src="images/paper.svg" />
                    <h2>Something went wrong.</h2>
                    <p>Try reloading the webpage to fix the problem...</p>
                </div>
            );
        }

        return this.props.children;
    }
}