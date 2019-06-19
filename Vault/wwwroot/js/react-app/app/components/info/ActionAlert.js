import React from 'react';
import swal from '@sweetalert/with-react';

export class ActionAlert {
    constructor(action) {
        swal(action, {
            buttons: false,
        });
    }
}