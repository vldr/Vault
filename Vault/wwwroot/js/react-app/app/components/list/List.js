import React from 'react';

import { Pathbar } from '../topbar/Pathbar';
import { Error } from '../info/Error';
import { Loading } from '../info/Loading';

import { Folder } from './Folder';

export class List extends React.Component
{
    constructor(props)
    {
        super(props);

        // Setup our states...
        this.state = {
            error: null,
            finished: false,
            response: null
        };
    }

    componentDidMount() {
        this.requestList();
    }

    /**
     * Requests the list of files and folders...
     * @param {any} offset Offset of where we want to display our files...
     */
    requestList(offset = 0) {
        fetch("process/list",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `offset=${offset}`
            })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        finished: true,
                        response: result
                    });
                },
                (error) => {
                    this.setState({
                        finished: true,
                        error
                    });
                }
            );
    }

    render() {
        // Setup our state variables...
        const { error, finished, response } = this.state;

        // Check if there is an error loading our files...
        if (error) 
            return (
                <Error message={error.message} />
            );
        // Check if our content is still loading...
        else if (!finished)
            return (
                <Loading />
            );

        // Check if our request was unsuccessful...
        if (!response.success)
            return (
                <Error message={response.reason} />
            );

        // Find our recycle bin...
        const recycleBin = response.folders.find((folder) => folder.isRecycleBin);

        // Otherwise render all our items...
        return (
            <div>
                <div id="folder-listing">
                    {
                        response.folders.map((folder) => { if (!folder.isRecycleBin) return <Folder folder={folder} /> })
                    }

                    <Folder folder={recycleBin} />;
                </div>
            </div>
        );
    }
}