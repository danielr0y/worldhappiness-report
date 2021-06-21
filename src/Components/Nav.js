import { NavLink, useLocation } from 'react-router-dom';
import useSession from '../Hooks/useSession';


export default function Nav(){
  const {loggedin, logout} = useSession();
  useLocation(); // forces remount on location change to ensure loggedin stays in sync

  return(
    <nav className="nav nav-pills flex-column flex-sm-row mt-1 mb-3">
      <NavLink className="nav-link text-sm-center " activeClassName="active" to="/rankings">rankings</NavLink>
      <NavLink className="nav-link text-sm-center " activeClassName="active" to="/countries">countries</NavLink>
      { !loggedin ? <NavLink className="nav-link text-sm-center " activeClassName="active" to="/register">register</NavLink> : <></>}
      { loggedin ? <button className="nav-link text-sm-center btn ml-auto" onClick={logout}>logout</button> : <NavLink className="nav-link text-sm-center ml-auto" to="/login">login</NavLink>}
    </nav>
  )
}