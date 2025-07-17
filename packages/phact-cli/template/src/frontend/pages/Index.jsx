import React from 'react';
import {Head} from 'phact/components';

function Index({props}) {
    return (
        <>
            <Head>
                <title>Index</title>
            </Head>
            <p>{props.name}</p>
        </>
    );
}

export default Index;