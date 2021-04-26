import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createDocument } from '../../store/actions/documentActions'
import { Redirect } from 'react-router-dom'
import M from "materialize-css"

class CreateDocument extends Component {
    state = {
        title: '',
        content: '',
        status: ''
    }

    handleFileChosen = () => {
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        var textFile = /text.*/;
        if (file) {
            if (file.type.match(textFile)) {
                reader.onload = function (event) {
                    var text = event.target.result;
                    var name = file.name
                    this.setState({
                        title: name,
                        content: text,
                        status: 'อยู่ระหว่างการตรวจสอบ'
                    })
                }.bind(this)
            } else {
                console.log('It doesn\'t seem to be a text file!')
            }

            reader.readAsText(file)
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.createDocument(this.state)
        this.props.history.push('/')
    }
    render() {
        M.AutoInit();
        const { auth } = this.props;
        if (!auth.uid) return <Redirect to='/signin' />
        return (
            <div className="container">
                <div className="row">
                    <div className="col s12 m3 l3" />
                    <div className="col s12 m6 l6">
                        <form className="white z-depth-2"
                            onKeyPress={event => {
                                if (event.which === 13 /* Enter */) {
                                    event.preventDefault();
                                }
                            }} onSubmit={this.handleSubmit}>
                            <h5 className="grey-text text-darken-3">Upload new file</h5>
                            <div className="col s12 center-align">
                                <i class="material-icons large" style={{color: '#a6a6a6'}}>cloud_upload</i>
                            </div>
                            <div class="file-field input-field">
                                <div class="waves-effect waves-light btn pink lighten-1 hoverable">
                                    <span>File</span>
                                    <input required type="file" onChange={this.handleFileChosen} />
                                </div>
                                <div class="file-path-wrapper">
                                    <input class="file-path validate" type="text" />
                                </div>
                            </div>
                            <div className="input-field center-align">
                                <button id="submit-button" className="hoverable btn-large pink lighter-1">Upload file</button>
                            </div>
                        </form>
                    </div>
                    <div className="col s12 m3 l3" />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.firebase.auth
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        createDocument: (document) => dispatch(createDocument(document))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateDocument)