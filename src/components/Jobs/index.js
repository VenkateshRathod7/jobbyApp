import React from 'react'
import Cookies from 'js-cookie'
import {withRouter} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const Profile = ({name, title, avatar}) => (
  <div className="profile-card">
    <div className="profile-avatar">
      <img src={avatar} alt="profile" />
    </div>
    <div className="profile-info">
      <h1>{name}</h1>
      <p>{title}</p>
    </div>
  </div>
)

const EmploymentTypeFilter = ({employmentTypesList, onChange}) => (
  <div className="employment-type-filter">
    <h3>Type of Employment</h3>
    <ul>
      {employmentTypesList.map(({label, employmentTypeId}) => (
        <li key={employmentTypeId} className="filter-item">
          <input
            type="checkbox"
            id={employmentTypeId}
            onChange={e => onChange(employmentTypeId, e.target.checked)}
          />
          <label htmlFor={employmentTypeId}>{label}</label>
        </li>
      ))}
    </ul>
  </div>
)

const SalaryRangeFilter = ({
  salaryRangesList,
  selectedSalaryRange,
  onChange,
}) => (
  <div className="salary-range-filter">
    <h3>Salary Range</h3>
    <ul>
      {salaryRangesList.map(({salaryRangeId, label}) => (
        <li key={salaryRangeId} className="filter-item">
          <input
            type="radio"
            id={salaryRangeId}
            name="salaryRange"
            checked={selectedSalaryRange === salaryRangeId}
            onChange={() => onChange(salaryRangeId)}
          />
          <label htmlFor={salaryRangeId}>{label}</label>
        </li>
      ))}
    </ul>
  </div>
)

class Jobs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      profile: {
        name: '',
        avatar: '',
        title: '',
      },
      loadingProfile: true,
      loadingJobs: true,
      jobsList: [],
      searchQuery: '',
      selectedEmploymentTypes: [],
      selectedSalaryRange: '',
      profileError: false,
      jobsError: false,
    }
  }

  componentDidMount() {
    this.fetchProfile()
    this.fetchJobs()
  }

  fetchProfile = async () => {
    const token = Cookies.get('jwt_token')
    if (!token) {
      const {history} = this.props
      history.push('/login')
      return
    }

    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await fetch('https://apis.ccbp.in/profile', options)
      if (!response.ok) throw new Error('Profile fetch failed')
      const data = await response.json()
      const {name, profile_image_url: avatar, title} = data.profile_details

      this.setState({
        profile: {name, avatar, title},
        loadingProfile: false,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      this.setState({loadingProfile: false, profileError: true})
    }
  }

  fetchJobs = async () => {
    const token = Cookies.get('jwt_token')
    if (!token) {
      const {history} = this.props
      history.push('/login')
      return
    }

    const {searchQuery, selectedEmploymentTypes, selectedSalaryRange} =
      this.state
    const employmentType = selectedEmploymentTypes.join(',') || ''
    const minimumPackage = selectedSalaryRange || ''

    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await fetch(
        `https://apis.ccbp.in/jobs?employment_type=${employmentType}&minimum_package=${minimumPackage}&search=${searchQuery}`,
        options,
      )
      if (!response.ok) throw new Error('Jobs fetch failed')
      const data = await response.json()

      this.setState({
        jobsList: data.jobs,
        loadingJobs: false,
        jobsError: false,
      })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      this.setState({loadingJobs: false, jobsError: true})
    }
  }

  handleSearchChange = event => {
    this.setState({searchQuery: event.target.value}, this.fetchJobs)
  }

  handleEmploymentChange = (employmentTypeId, isChecked) => {
    const {selectedEmploymentTypes} = this.state
    const updatedEmploymentTypes = isChecked
      ? [...selectedEmploymentTypes, employmentTypeId]
      : selectedEmploymentTypes.filter(type => type !== employmentTypeId)

    this.setState(
      {selectedEmploymentTypes: updatedEmploymentTypes},
      this.fetchJobs,
    )
  }

  handleSalaryRangeChange = salaryRangeId => {
    this.setState({selectedSalaryRange: salaryRangeId}, this.fetchJobs)
  }

  handleJobClick = jobId => {
    const {history} = this.props
    history.push(`/jobs/${jobId}`) // Navigate to JobItemDetails route
  }

  handleRetry = () => {
    this.setState(
      {
        jobsError: false,
        profileError: false,
        loadingProfile: true,
        loadingJobs: true,
      },
      () => {
        this.fetchProfile()
        this.fetchJobs()
      },
    )
  }

  renderProfile() {
    const {profile, loadingProfile, profileError} = this.state

    if (loadingProfile) {
      return <p>Loading...</p>
    }

    if (profileError) {
      return (
        <div>
          <button onClick={this.handleRetry}>Retry</button>
        </div>
      )
    }

    return (
      <div className="profile-container">
        <Profile
          name={profile.name}
          title={profile.title}
          avatar={profile.avatar}
        />
      </div>
    )
  }

  renderJobsList() {
    const {jobsList, loadingJobs, jobsError} = this.state

    if (loadingJobs) {
      return <p>Loading jobs...</p>
    }

    if (jobsError) {
      return (
        <div className="error-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
            className="failure-image"
          />
          <h1>Oops! Something Went Wrong</h1>
          <button onClick={this.handleRetry}>Retry</button>
        </div>
      )
    }

    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-container">
          <h1>No Jobs Found</h1>
          <p>We could not find any jobs. Try other filters.</p>
        </div>
      )
    }

    return (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <li
            key={job.id}
            className="job-item"
            onClick={() => this.handleJobClick(job.id)}
          >
            <img
              src={job.company_logo_url}
              alt="company logo"
              className="job-logo"
            />
            <div className="job-details">
              <h3>{job.title}</h3>
              <p>{job.job_description}</p>
              <p>Location: {job.location}</p>
              <p>Employment Type: {job.employment_type}</p>
              <p>Package: {job.package_per_annum}</p>
              <p>Rating: {job.rating}</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    return (
      <>
        <Header />
        <div className="jobscontainer">
          <div className="filterItems">
            {this.renderProfile()}
            <hr className="divider" />
            <EmploymentTypeFilter
              employmentTypesList={[
                {label: 'Full Time', employmentTypeId: 'FULLTIME'},
                {label: 'Part Time', employmentTypeId: 'PARTTIME'},
                {label: 'Freelance', employmentTypeId: 'FREELANCE'},
                {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
              ]}
              onChange={this.handleEmploymentChange}
            />
            <hr className="divider" />
            <SalaryRangeFilter
              salaryRangesList={[
                {salaryRangeId: '1000000', label: '10 LPA and above'},
                {salaryRangeId: '2000000', label: '20 LPA and above'},
                {salaryRangeId: '3000000', label: '30 LPA and above'},
                {salaryRangeId: '4000000', label: '40 LPA and above'},
              ]}
              selectedSalaryRange={this.state.selectedSalaryRange}
              onChange={this.handleSalaryRangeChange}
            />
          </div>
          <div className="jobslists">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="Search jobs..."
                value={this.state.searchQuery}
                onChange={this.handleSearchChange}
              />
              <button className="search-button" data-testid="searchButton">
                🔍
              </button>
            </div>
            {this.renderJobsList()}
          </div>
        </div>
      </>
    )
  }
}

export default withRouter(Jobs)
