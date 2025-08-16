import { Link } from 'react-router-dom';

function Home(){

  return(
    <div className="container">
      <h2>back to <Link to='/register'>Register</Link></h2>
      <h2>back to <Link to='/login'>Login</Link></h2>
    </div>
  )
}

export default Home