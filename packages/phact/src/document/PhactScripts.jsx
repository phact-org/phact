import React from 'react';

function PhactScripts({pageName}) {
    return (
        <>
            <script
                id="__PHACT_DATA__"
                type="application/json"
                dangerouslySetInnerHTML={{
                    __html: `<?php echo json_encode($props); ?>`,
                }}
            />
            <script src={`/${pageName}.js`}></script>
        </>
    );
}

export default PhactScripts;