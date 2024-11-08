import React from 'react'
import Cookies from 'js-cookie'
import './index.css'
import Header from '../Header'

class JobItemDetails extends React.Component {
  state = {
    jobDetails: {},
    similarJobs: [],
    loading: true,
    error: false,
  }

  componentDidMount() {
    this.fetchJobDetails()
  }

  fetchJobDetails = async () => {
    const {match} = this.props
    const {jobId} = match.params
    const token = Cookies.get('jwt_token')

    try {
      const url = `https://apis.ccbp.in/jobs/${jobId}`
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await fetch(url, options)

      if (!response.ok) throw new Error('Job details fetch failed')

      const data = await response.json()

      this.setState({
        jobDetails: data.job_details,
        similarJobs: data.similar_jobs,
        loading: false,
        error: false,
      })
    } catch {
      this.setState({loading: false, error: true})
    }
  }

  handleRetry = () => {
    this.setState({loading: true, error: false}, this.fetchJobDetails)
  }

  renderError = () => (
    <div className="error-container">
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <button onClick={this.handleRetry}>Retry</button>
    </div>
  )

  renderJobDetails = () => {
    const {jobDetails, similarJobs} = this.state

    return (
      <div className="job-detail">
        <Header />
        <button className="back-button" onClick={this.props.onBack}>
          Back
        </button>
        <div className="job-detail-content">
          <div className="company-logo-container">
            <img
              className="company-logo"
              src={jobDetails.company_logo_url}
              alt="job details company logo"
            />
          </div>
          <div className="job-details-text">
            <h1>{jobDetails.title}</h1>
            <p>{jobDetails.job_description}</p>
            <p>
              <strong>Location:</strong> {jobDetails.location}
            </p>
            <p>
              <strong>Employment Type:</strong> {jobDetails.employment_type}
            </p>
            <p>
              <strong>Package:</strong> {jobDetails.package_per_annum}
            </p>
            <p>
              <strong>Rating:</strong> {jobDetails.rating}
            </p>
            <h1>Skills Required:</h1>
            <ul className="skills-container">
              {jobDetails.skills.map(skill => (
                <li key={skill.name} className="skill-item">
                  <img
                    className="skill-image"
                    src={skill.image_url}
                    alt={skill.name}
                  />
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <img
          src={jobDetails.life_at_company?.image_url}
          alt="life at company"
          className="life-at-company-img"
        />
        <h1>Similar Jobs:</h1>
        <ul className="similar-jobs-container">
          {similarJobs.map(similarJob => (
            <li key={similarJob.id} className="similar-job-item">
              <h1>{similarJob.title}</h1>
              <p>{similarJob.job_description}</p>
              <p>
                <strong>Location:</strong> {similarJob.location}
              </p>
              <p>
                <strong>Rating:</strong> {similarJob.rating}
              </p>
              <p>
                <strong>Employment Type:</strong> {similarJob.employment_type}
              </p>
              <img
                className="company-logo"
                src={similarJob.company_logo_url}
                alt="similar job company logo"
              />
            </li>
          ))}
        </ul>
        <h1>Description</h1>
        <p>{jobDetails.life_at_company?.description}</p>
        <a
          href={jobDetails.company_website_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit
        </a>
      </div>
    )
  }

  render() {
    const {loading, error} = this.state

    if (loading) {
      return <p>Loading job details...</p>
    }

    if (error) {
      return this.renderError()
    }

    return this.renderJobDetails()
  }
}

export default JobItemDetails
