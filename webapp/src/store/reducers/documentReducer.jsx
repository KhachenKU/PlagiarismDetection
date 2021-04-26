const initState = {
    documents:[
        {id: '1', title: 'help me find peach', content: 'blah blah blah'}
    ]
}

const documnetReducer = (state = initState, action) => {
    switch (action.type) {
        case 'CREATE_DOCUMENT':
            console.log('created project', action.document)
            return state;
        case 'CREATE_PROJECT_ERROR':
            console.log('create project error', action.err)
            return state;
        default:
            return state;
    }
}

export default documnetReducer