import React from 'react';

function Head({children, collectedHead}) {
    return (
        <head>
            {children}
            {collectedHead}
        </head>
    );
}

export default Head;