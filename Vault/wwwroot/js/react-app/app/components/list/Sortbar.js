import React from 'react';

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
         
        // Attempt to update the sorting...
        fetch("process/sortby",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `sortby=${encodeURIComponent(override ? sortBy : Math.sign(sort) * sortBy)}`
            })
            .then(res => res.json())
            .then(
                (result) => 
                {
                    // TODO: implement this...
                },
                (error) => 
                {
                    swal(error.message);
                }
            );
    }

    render()
    {
        // Setup our sort variable from our props...
        const sort = this.props.sort;

        return (
            <div id="sort-box">
                <a className="sorting-option-left" style={this.getSelectedStyle(2)} onClick={this.setSort.bind(this, 2, false)}>Name</a>

                <img id={sort >= 0 ? "sorting-arrow" : "sorting-arrow-down"} onClick={this.setSort.bind(this, -sort, true)} src="images/ui/arrow.svg" />

                <a className="sorting-option option-1" style={this.getSelectedStyle(1)} onClick={this.setSort.bind(this, 1, false)}>Size</a>
                <a className="sorting-option option-2" style={this.getSelectedStyle(3)} onClick={this.setSort.bind(this, 3, false)}>Date</a>
                <a className="sorting-option option-2" style={this.getSelectedStyle(4)} onClick={this.setSort.bind(this, 4, false)}>Type</a>
            </div>
        );
    }
}