import React from 'react'

const DocumentSummary = ({order, document}) => {
    // console.log(document)
    return (
        <>
            <td>{document.title}</td>
            <td>{document.status}</td>
        </>
    )
}

export default DocumentSummary