import React from 'react';
import styles from '../../app/App.css';

import { Comment } from './Comment';

class Comments extends React.Component
{
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isCommentsLoading: true,
            error: null,
            response: null,
            offset: 0
        };
    }

    componentDidMount() { this.getComments(); }

    postComment()
    {
        // Check if we were given a share id...
        if (!this.props.id) return;

        // Check if comments are loading...
        if (this.isCommentsLoading)
        {
            // Stop our loading state...
            this.setState({ error: "Please wait while the comments load..." });

            // Return here..
            return;
        }

        // Set our state to be started...
        this.setState({
            isLoading: true
        });

        // Fetch our delete file request...
        fetch(!this.props.local ? "postcomment" : "process/postcomment",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }, 
                body: `id=${encodeURIComponent(this.props.id)}`
                    + (!this.props.local ? `&name=${encodeURIComponent(this.name.value)}` : '')
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
                    else
                    {
                        // Add our comment if our response is set...
                        if (this.state.response)
                        {
                            // Add our item to the top...
                            this.state.response.comments.unshift(result.comment);

                            // Increase our total...
                            this.state.response.total += 1;

                            // Update our offset...
                            this.state.offset = this.state.response.comments.length;
                        }
                        // Otherwise, create our own...
                        else {
                            // Setup a blank array...
                            let comments = [];

                            // Push our new comment into it...
                            comments.push(result.comment);

                            // Set a dummy response...
                            this.state.response = { success: true, comments: comments };
                        }

                        // Empty our boxes...
                        if (!this.props.local) this.name.value = '';

                        this.content.value = '';

                        // Set our loading to be false...
                        this.setState({ isLoading: false, response: this.state.response, offset: this.state.offset });  
                    }
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
        if (!this.props.id || this.state.isFinished) return;

        // Set our comments to be loading to true...
        this.setState({ isCommentsLoading: true });

        // Fetch our delete file request...
        fetch(this.props.local ? "process/comments" : "comments",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${encodeURIComponent(this.props.id)}&offset=${this.state.offset}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    // Check if we're not logged in or something...
                    if (!result.success)
                        // Stop our loading state...
                        this.setState({ isCommentsLoading: false, error: result.reason });
                    // Set our response and turn off isLoading...
                    else
                    {
                        // Setup our response...
                        let response = null;

                        // Check if our response is set and then concat if it is...
                        if (this.state.response)
                        {
                            response = this.state.response;
                            response.comments = this.state.response.comments.concat(result.comments);
                        }
                        // Otherwise simply set result as the response...
                        else response = result;

                        // Set our state...
                        this.setState({ isCommentsLoading: false, response: response, offset: response.comments.length });
                    }
                },
                (error) => {
                    // Stop our loading state...
                    this.setState({ isCommentsLoading: false, error: error.message });
                }
            );
    }

    onClick() { this.postComment(); }

    removeComment(comment)
    {
        // Find our comment's index...
        const commentIndex = this.state.response.comments.findIndex((x) => x.id === comment.id);

        // Check that it exists...
        if (commentIndex === -1) return;

        // Remove our comment...
        this.state.response.comments.splice(commentIndex, 1);

        // Increase our total...
        this.state.response.total -= 1;

        // Update our offset...
        this.state.offset = this.state.response.comments.length;

        // Set our loading to be false...
        this.setState({ response: this.state.response, offset: this.state.offset });  
    }

    render()
    {
        // Setup our error...
        const error = this.state.error && (<div className={styles["comment-error"]}>{this.state.error}</div>);

        // Setup our comments
        const comments = this.state.response && this.state.response.comments.map((comment, i) => (<Comment key={comment.id} local={this.props.local}
            removeComment={this.removeComment.bind(this)} comment={comment} />));

        // Setup our post box's style...
        const postBoxStyle = { display: this.state.isLoading ? "none" : "block" };
        const postBoxLoaderStyle = { display: !this.state.isLoading ? "none" : "block" };

        // Setup our post box's style...
        const commentBoxStyle = { display: this.state.isCommentsLoading ? "none" : "block" };
        const commentBoxLoaderStyle = { display: !this.state.isCommentsLoading ? "none" : "block" };

        // Return our rendered result...
        return (<>
            {error}

            <div className={styles["comment-editor"]}>
                <div className={styles['loader']} style={postBoxLoaderStyle} />

                <div style={postBoxStyle}>
                    <h2>Comments</h2>

                    {!this.props.local && <input ref={(input) => { this.name = input; }} type="text" placeholder="Name" />}

                    <textarea ref={(input) => { this.content = input; }} placeholder="Write a comment" />
                    <br />
                    <button className={styles["button"]} onClick={this.onClick.bind(this)}>Post</button>
                </div>
            </div> 

            <div className={styles["comment-section"]}>
                <div>
                    {comments}

                    {
                        this.state.response && this.state.response.comments.length !== this.state.response.total
                        && <button style={commentBoxStyle} className={styles["button"]} onClick={this.getComments.bind(this)}>Load more comments...</button>
                    }
                </div>
                <div className={styles['loader']} style={commentBoxLoaderStyle} />
            </div>
        </>);
    }
}

export default Comments;