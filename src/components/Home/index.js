import React from 'react'
import Cookies from 'js-cookie'
import {Redirect, Link} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const Home = () => {
  const jwtToken = Cookies.get('jwt_token')
  if (jwtToken === undefined) {
    return <Redirect to="/login" />
  }

  return (
    <>
      <Header />
      <div className="bg-containerhome">
        <h1>Find The Job That Fits Your Life</h1>
        <p>
          Millions of people are searching for jobs, salary information, company
          reviews. Find the job that fits your abilities and potential.
        </p>

        <Link to="/jobs">
          <button className="find-jobs-button">Find Jobs</button>
        </Link>

        <img
          src="https://assets.ccbp.in/frontend/react-js/home-sm-bg.png"
          alt="Home Background"
          className="home-image"
        />
      </div>
    </>
  )
}

export default Home
