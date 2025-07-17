import React from 'react';

export const collectedHead = [];

function Head({children}) {
    collectedHead.push(...React.Children.toArray(children));
    return null;
}

export default Head;
