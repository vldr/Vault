import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../App.css';

export class Sortbar extends React.Component {

    /**
     * Gets the styling for each option...
     * @param {any} id The id of the option...
     * @returns {any} Style struct...
     */
    getSelectedStyle(id) {
        // Setup our sort variable from our props...
        const sort = this.props.sort;

        // Return our selected style...
        return (Math.abs(sort) === id ? { fontWeight: "600" } : {});
    }

    /**
     * Requests to sort by...
     * @param {any} sortBy The number you wish to sort by...
     * @param {any} override Wether to disable auto flipping of the signs...
     */   
    setSort(sortBy, override) {
        // Setup our sort variable from our props...
        const sort = this.props.sort;

        // Setup a loading dialog...
        swal(<center><div className={styles["loader"]} /></center>,
        {
            buttons: false,
            closeOnClickOutside: false
        });

        // Attempt to update the sorting...
        fetch("process/sortby",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `sortby=${encodeURIComponent(override ? sortBy : Math.sign(sort) * sortBy)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    swal.close();
                },
                (error) => 
                {
                    swal(error.message, {
                        buttons: false
                    });
                }
            );
    }

    render()
    {
        // Setup our sort variable from our props...
        const sort = this.props.sort;

        return (
            <div className={styles["sort-box"]}>
                <a className={styles["sorting-option-left"]}
                    style={this.getSelectedStyle(2)}
                    onClick={this.setSort.bind(this, 2, false)}>Name</a>

                <img className={sort >= 0 ? styles["sorting-arrow"] : styles["sorting-arrow-down"]}
                    onClick={this.setSort.bind(this, -sort, true)} src="images/ui/arrow.svg" />

                <a className={`${styles["sorting-option"]} ${styles["option-1"]}`}
                    style={this.getSelectedStyle(1)}
                    onClick={this.setSort.bind(this, 1, false)}>Size</a>

                <a className={`${styles["sorting-option"]} ${styles["option-2"]}`}
                    style={this.getSelectedStyle(3)}
                    onClick={this.setSort.bind(this, 3, false)}>Date</a>

                <a className={`${styles["sorting-option"]} ${styles["option-2"]}`}
                    style={this.getSelectedStyle(4)}
                    onClick={this.setSort.bind(this, 4, false)}>Type</a>
            </div>
        );
    }
}