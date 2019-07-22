import React from 'react';
import swal from '@sweetalert/with-react';
import styles from '../../app/App.css';
import AsSingleton from '@peterbee/react-singleton';

export class Sortbar extends React.Component {

    constructor(props) {
        super(props);

        this.state = { sort: 1 };
    }

    /**
     * Visually sets the sort order...
     * @param {any} sort The sort order...
     */
    setVisualSort(sort) { this.setState({ sort: sort }); }

    /**
     * Gets the styling for each option...
     * @param {any} id The id of the option...
     * @returns {any} Style struct...
     */
    getSelectedStyle(id) {
        // Setup our sort variable from our props...
        const sort = this.state.sort;

        // Return our selected style...
        return (Math.abs(sort) === id ? {
            fontWeight: "600",
            paddingLeft: "10px",
            marginLeft: "3px",
            background: sort > 0 ? "url(../../../images/ui/arrow-up.svg) 0px center / 11px no-repeat"
                : "url(../../../images/ui/arrow.svg) 0px center / 11px no-repeat",
        } : {});
    }


    /**
     * Requests to sort by...
     * @param {any} sortBy The number you wish to sort by...
     * @param {any} override Wether to disable auto flipping of the signs...
     */   
    setSort(sortBy, override) {
        // Setup our sort variable from our props...
        const sort = this.state.sort;

        // Setup a loading dialog...
        swal(<center><div className={styles["loader"]} /></center>,
        {
            buttons: false,
            closeOnClickOutside: false
        });

        // Flip our symbol if it is the same value...
        if (Math.abs(sortBy) === Math.abs(sort)) sortBy *= Math.sign(-this.state.sort);
        else sortBy *= Math.sign(this.state.sort);

        // Attempt to update the sorting...
        fetch("process/sortby",
            {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `sortby=${encodeURIComponent(sortBy)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    // Close our modal...
                    swal.close();

                    // Update our window variable...
                    window.sort = sortBy;

                    // Update our sort visually...
                    this.setState({ sort: sortBy });
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
        // Render nothing if it is disabled...
        if (this.props.disabled) return null;

        // Setup our sort variable from our props...
        const sort = this.state.sort;

        return (
            <>
                <a className={styles["sorting-option"]}
                    style={this.getSelectedStyle(2)}
                    onClick={this.setSort.bind(this, 2, false)}>Name</a>

                <a className={styles["sorting-option"]}
                    style={this.getSelectedStyle(1)}
                    onClick={this.setSort.bind(this, 1, false)}>Size</a>

                <a className={styles["sorting-option"]}
                    style={this.getSelectedStyle(3)}
                    onClick={this.setSort.bind(this, 3, false)}>Date</a>

                <a className={styles["sorting-option"]}
                    style={this.getSelectedStyle(4)}
                    onClick={this.setSort.bind(this, 4, false)}>Type</a>
            </>
        );
    }
}