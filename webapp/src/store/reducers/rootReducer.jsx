import authReducer from './authReducer'
import documnetReducer from './documentReducer'
import { combineReducers } from 'redux'
import { firestoreReducer } from 'redux-firestore'
import { firebaseReducer } from 'react-redux-firebase'

const rootReducer = combineReducers({
    auth: authReducer,
    document: documnetReducer,
    firestore: firestoreReducer,
    firebase: firebaseReducer
})

export default rootReducer