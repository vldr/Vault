import React from 'react';
import swal from '@sweetalert/with-react';

export class ActionAlert {
    constructor(action)
    {
        return swal(action,
            {
                buttons: false
            });
    }
}