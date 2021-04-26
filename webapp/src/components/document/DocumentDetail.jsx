import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import M from "materialize-css"
import './css/document.css'

const DocumentDetail = (props) => {
    M.AutoInit();
    const { document, auth } = props;
    if (!auth.uid) return <Redirect to='/signin' />
    if (document) {
        return (
            <div className="container section project-details">
                <div className="row">
                    <br/><br/>
                    <div className=" col s12 m6">
                        <div className="card z-depth-1">
                            <div className="card-content">
                                <span className="card-title">{document.title}</span>
                                <div dangerouslySetInnerHTML={{ __html: document.content}}/>
                            </div>
                        </div>
                    </div>
                    <div className="col s12 m5 offset-m1">
                        <div className="pink lighten-4 center">
                            <h1>{document.percent}%</h1>
                        </div>
                        <ul class="collapsible white">
                            { document.all_same_sents && document.all_same_sents.map((all_same_sent) => {
                                return (
                                    <li>
                                        <div class="collapsible-header"><i class="material-icons">list</i>{all_same_sent.name}</div>
                                        <div class="collapsible-body"><span>{all_same_sent.sent}</span></div>
                                    </li>
                                    )
                                }
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="container center">
                <p>Loading project...</p>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    // console.log(state);
    const id = ownProps.match.params.id
    const documents = state.firestore.data.documents
    const document = documents ? documents[id] : null
    return {
        document: document,
        auth: state.firebase.auth
    }
}

export default compose(
    connect(mapStateToProps),
    firestoreConnect([
        { collection: 'documents' }
    ])
)(DocumentDetail)
