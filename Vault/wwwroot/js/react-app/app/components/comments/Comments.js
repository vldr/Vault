import React from 'react';
import styles from '../../app/App.css';

class Comments extends React.Component
{
    constructor(props) {
        super(props);
    }

    render() {
        return (<>
            <div className={styles["comment-editor"]}>
                <input type="text" placeholder="Name" />
                <input type="text" placeholder="Write a comment" />
            </div>

            <div className={styles["comments"]}>
                <img src="images/ui/logo.svg" />
            </div>
        </>);
    }
}

export default Comments;