import React from 'react';
import styles from '../../app/App.css';

class Comments extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            error: null,
            response: null
        };
    }

    componentDidMount()
    {
        this.getComments();
    }

    postComment()
    {
        // Check if we were given a share id...
        if (!this.props.shareId) return;

        // Set our state to be started...
        this.setState({
            isLoading: true
        });

        // Fetch our delete file request...
        fetch("postcomment",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `shareId=${encodeURIComponent(this.props.shareId)}`
                    + `&name=${encodeURIComponent(this.name.value)}`
                    + `&content=${encodeURIComponent(this.content.value)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if we're not logged in or something...
                    if (!result.success)
                        // Stop our loading state...
                        this.setState({ isLoading: false, error: result.reason });
                    // Set our response and turn off isLoading...
                    else this.getComments();
                },
                (error) => {
                    // Stop our loading state...
                    this.setState({ isLoading: false, error: error.message });
                }
            );
    }

    getComments()
    {
        // Check if we were given a share id...
        if (!this.props.shareId) return;

        // Fetch our delete file request...
        fetch("comments",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `shareId=${encodeURIComponent(this.props.shareId)}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if we're not logged in or something...
                    if (!result.success) 
                        // Stop our loading state...
                        this.setState({ isLoading: false, error: result.reason, response: null });
                    // Set our response and turn off isLoading...
                    else
                        this.setState({ isLoading: false, response: result, error: null });
                },
                (error) => {
                    // Stop our loading state...
                    this.setState({ isLoading: false, error: error.message, response: null });
                }
            );
    }

    onClick() { this.postComment(); }

    render()
    {
        // Setup our error...
        const error = this.state.error && (<div className={styles["comment-error"]}>{this.state.error}</div>);

        // Setup our comments
        const comments = this.state.response && this.state.response.comments.map((comment, i) => <div key={comment.id}>{comment.content}</div>);

        // Return loader if we're loading...
        if (this.state.isLoading) return <div className={styles['loader']} />;
        // Return actual content if we're done loading...
        else
            return (<>
                {error}

                <div className={styles["comment-editor"]}>
                    <h2>Comments</h2>
                    <input ref={(input) => { this.name = input; }} type="text" placeholder="Name" />
                    <textarea ref={(input) => { this.content = input; }} placeholder="Write a comment" />

                    <button className={styles["button"]} onClick={this.onClick.bind(this)}>Post</button>
                </div>

                <div className={styles["comment-section"]}>
                    {comments}
                </div>
            </>);
    }
}

export default Comments;