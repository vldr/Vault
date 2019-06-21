import React from 'react';
import styles from '../../App.css';

export class Pathbar extends React.Component
{
    render() 
    {
        const path = this.props.path;

        return (
            <div className={styles['folder-path']}>
                {
                    path.map((item, i) =>
                    {
                        return (<span key={item.id} onClick={this.props.gotoFolder.bind(this, item.id)}>{item.name} / </span>)
                    })
                }
            </div>
        );
    }
}