import React from "react";
import Main from "./Main";
import Head from "./Head";
import {collectedHead} from '../components/Head';
import PhactScripts from "./PhactScripts";

function Document({pageName, AppContents}) {
    return (
        <html>
        <Head collectedHead={collectedHead} />
        <body>
        <div id="__phact-root">
            <Main App={AppContents}/>
        </div>
        <PhactScripts pageName={pageName}/>
        </body>
        </html>
    );
}

export default Document;