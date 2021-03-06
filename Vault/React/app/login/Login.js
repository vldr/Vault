﻿import React, { Suspense }  from 'react';
import ReactDOM from 'react-dom';

const IntroBox = React.lazy(() => import('../components/login/IntroBox'));

import styles from './Login.css';

export class Login extends React.Component
{
    render()
    {
        // Setup our loader...
        const loader = (<img className={styles["cog-wheel"]} src="images/cog.svg" />);

        return (<div className={styles["login-container"]}>
                <Suspense fallback={loader}>
                    <IntroBox />
                </Suspense>
            </div>);
    }
}

// Render our actual app...
ReactDOM.render(<Login />, document.getElementById("login"));