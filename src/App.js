import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import LoginForm from './components/Login'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import Jobs from './components/Jobs'
import JobItemDetails from './components/JobItemDetails'

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/login" component={LoginForm} />
      <ProtectedRoute exact path="/" component={Home} />
      <ProtectedRoute exact path="/jobs" component={Jobs} />
      <ProtectedRoute exact path="/jobs/:jobId" component={JobItemDetails} />
      <Route path="/not-found" component={NotFound} />
      <Route path="*">
        <Redirect to="/not-found" />
      </Route>
    </Switch>
  </BrowserRouter>
)

export default App
