import React, { Component } from 'react'
import DocumenttList from '../document/DocumentList'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'

class Dashboard extends Component {
    render() {
        const { documents, auth } = this.props;
        // console.log(this.props)

        if(!auth.uid) return <Redirect to='/signin'/>
        return (
            <div className="dashboard container">
                <div className="row">
                    <div className="col s12 m1 l1"/>
                    <div className="col s12 m10 l10">
                        { documents ? <DocumenttList documents={documents}/> : null}
                    </div>
                    <div className="col s12 m1 l1"/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        documents: state.firestore.ordered.documents,
        auth: state.firebase.auth,
        notifications: state.firestore.ordered.notifications
    }
}

export default compose(
    connect(mapStateToProps),
    firestoreConnect((props) => {
        // console.log(props)
        if (!props.auth.isEmpty) {
            const { uid } = props.auth;
            return [
                { collection: 'documents', where:[['authorId', '==', uid]], orderBy: ['createdAt', 'desc'] },
            ]
        }
        else{
            return [
                { collection: 'documents', orderBy: ['createdAt', 'desc'] },
            ]
        }
    })
)(Dashboard)