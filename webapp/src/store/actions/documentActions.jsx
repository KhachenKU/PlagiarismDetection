export const createDocument = (document) => {
    return (dispatch, getState, { getFirebase }) => {
        // make async call to database
        const firestore = getFirebase().firestore();
        const profile = getState().firebase.profile;
        const authorId = getState().firebase.auth.uid;
        firestore.collection('documents').add({
            ...document,
            authorFirstName: profile.firstName,
            authorLastName: profile.lastName,
            authorId: authorId,
            createdAt: new Date()
        }).then(() => {
            dispatch({ type: 'CREATE_DOCUMENT', document });
        }).catch((err) => {
            dispatch({ type: 'CREATE_DOCUMENT_ERROR', err })
        })
    }
}