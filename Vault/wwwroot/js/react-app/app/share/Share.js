import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import styles from '../app/App.css';

const ShareViewer = React.lazy(() => import('../components/share/ShareViewer'));

// Set our webpack public path...
__webpack_public_path__ = "../" + __webpack_public_path__;

export class Share extends React.Component
{
    render()
    {
        // Check if our props are defined...
        if (!this.props.type || !this.props.id) return <p>Missing certain props...</p>;

        // Setup our loader...
        const loader = (<div className={styles["intro-box"]}>
            <div className={styles["loader"]} />
        </div>);

        // Return our visual rendering...
        return (<Suspense fallback={loader}>
            {this.props.type === "FILE" && <ShareViewer shareId={this.props.id} />}
            </Suspense>);
    }
}
    
// Setup our root object...
var root = document.getElementById('share');
    
// Render our actual app...
ReactDOM.render(<Share {...(root.dataset)} />, root);