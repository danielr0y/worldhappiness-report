import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import Year from '../Components/Year'


export default function Rankings(){
  let {path} = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/:year`}>
        <Year />
      </Route>
      <Route path={[`${path}/`, path]}>
        <Redirect to={`${path}/2020`} />
      </Route>
    </Switch>
  );
}