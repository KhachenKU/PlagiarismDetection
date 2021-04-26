import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Dashboard from './components/dashboard/Dashboard'
import DocumentDatail from './components/document/DocumentDetail'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import UploadDocument from './components/document/UploadDocument'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar/>
        <Switch>
          <Route path='/' exact component={Dashboard}></Route>
          <Route path='/document/:id' component={DocumentDatail}></Route>
          <Route path='/signin' component={SignIn}/>
          <Route path='/signup' component={SignUp}/>
          <Route path='/create' component={UploadDocument}/>
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
