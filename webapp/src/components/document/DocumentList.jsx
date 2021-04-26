import React, { useState, useEffect } from 'react'
import DocumentSummary from './DocumentSummary'
import { useHistory } from "react-router-dom";
import ReactPaginate from 'react-paginate'
import M from 'materialize-css';

const DocumenttList = ({documents}) => {
    const [currentdoc, setCurrentdoc] = useState(documents.slice(0, 5));
    const [currentPage, setCurrentPage] = useState(0);
    const PER_PAGE = 5;
    const offset = currentPage * PER_PAGE;
    const pageCount = documents ? Math.ceil(documents.length / PER_PAGE) : 0;
    function handlePageClick({ selected: selectedPage }) {
        setCurrentPage(selectedPage);
        
    }

    useEffect(() => {
        setCurrentdoc(documents.slice(offset, offset + PER_PAGE))
    }, [documents, offset])

    M.AutoInit();
    const history = useHistory();
    const handleRowClick = (document) => {
        if (document.status === 'ตรวจสอบสำเร็จ') {
            history.push(`/document/${document.id}`);
        } else {
            M.toast({html: 'กรุณาเลือกเอกสารที่ตรวจสอบสำเร็จแล้ว', displayLength: 3000, classes: 'grey darken-2'})
        }
    } 
    
    return (
        <div className="document-list section">
            <br/><br/><br/>
            <table className="highlight centered white z-depth-2" id="myTable">
                <thead>
                    <tr>
                        <th>รายชื่อเอกสาร</th>
                        <th>สถานะการตรวจสอบ</th>
                    </tr>
                </thead>
                <tbody>
                    { currentdoc && currentdoc.map((document) => {
                        return (
                            <tr key={document.id} onClick={() => handleRowClick(document)} style={{ cursor: 'pointer' }}>
                                <DocumentSummary document={document}/>
                            </tr>
                        )
                    }
                )}
                </tbody>
            </table>
            <div className="center-align">
                <ReactPaginate
                    previousLabel={"prev"}
                    nextLabel={"next"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active pink lighten-1"}/>
            </div>
        </div>
    )
}

export default DocumenttList