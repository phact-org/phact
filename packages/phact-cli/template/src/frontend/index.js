import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import {Main} from '@phact-org/phact/document';

export function hydrate(PageComponent) {
    let dataRaw = document.getElementById('__PHACT_DATA__').textContent;
    let data = JSON.parse(dataRaw);

    const root = document.getElementById('__phact-root');
    let pageComponentWithProps = <PageComponent props={data}/>

    if (root) {
        hydrateRoot(root, <Main App={pageComponentWithProps}/>);
    } else {
        console.error('Hydration failed: Root element #__phact-root not found.');
    }
}
