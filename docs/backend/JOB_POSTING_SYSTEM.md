# Job Posting System - Frontend Implementation Guide

## Backend Changes Summary

### ✅ Job Models Created
- `JobPosting`: Database model for job listings (created by employers)
- `JobApplication`: Database model for job applications (submitted by candidates)
- All mock jobs have been cleared

### ✅ New API Endpoints

#### Create Job Posting (Employer)
```
POST /api/v1/jobs
Headers: Authorization: Bearer {token}
Body:
{
  "title": "Frontend Developer",
  "description": "Build amazing UIs",
  "company_name": "TechCorp",
  "location": "Lagos, Nigeria",
  "job_type": "Full-time",
  "salary_min": 50000,
  "salary_max": 150000,
  "currency": "USD",
  "required_skills": ["React", "TypeScript", "Tailwind"],
  "experience_level": "Mid-level",
  "years_of_experience": 3,
  "education_requirement": "Bachelor's Degree",
  "benefits": ["Health Insurance", "Remote Work", "401k"],
  "remote_option": true,
  "deadline": "2026-05-31T23:59:59Z"
}
```

#### Get All Active Jobs
```
GET /api/v1/jobs?skip=0&limit=20
No authentication required (public endpoint)
Returns: Array of JobPostingResponse
```

#### Get Single Job
```
GET /api/v1/jobs/{job_id}
Returns: JobPostingResponse
```

#### Update Job Posting (Employer)
```
PUT /api/v1/jobs/{job_id}
Headers: Authorization: Bearer {token}
Body: JobPostingUpdateRequest (all fields optional)
```

#### Delete Job Posting (Employer)
```
DELETE /api/v1/jobs/{job_id}
Headers: Authorization: Bearer {token}
Deactivates the job posting (soft delete)
```

#### Get Employer's Jobs
```
GET /api/v1/employers/{employer_id}/jobs
Returns: Array of JobPostingResponse
```

#### Apply to Job (Candidate)
```
POST /api/v1/jobs/{job_id}/apply
Headers: Authorization: Bearer {token}
Body:
{
  "cover_letter": "I'm interested in this role...",
  "resume_url": "https://example.com/resume.pdf"
}
```

#### Get My Applications (Candidate)
```
GET /api/v1/my-applications
Headers: Authorization: Bearer {token}
Returns: Array of JobApplicationResponse
```

#### Get Job Applications (Employer)
```
GET /api/v1/jobs/{job_id}/applications
Headers: Authorization: Bearer {token}
Returns: Array of JobApplicationResponse
```

#### Update Application Status (Employer)
```
PUT /api/v1/applications/{application_id}/status
Headers: Authorization: Bearer {token}
Query: ?new_status=reviewed|shortlisted|rejected|accepted
```

---

## Frontend Components to Update/Create

### 1. **Update Jobs.jsx**
- Replace mock data with API call to `GET /api/v1/jobs`
- Add pagination support
- Add filtering by job type, location, salary range
- Add search functionality
- Display dynamic job listings

### 2. **Update JobDetails.jsx**
- Fetch job data from `GET /api/v1/jobs/{job_id}`
- Show employer information
- Display job requirements and benefits
- Show application count

### 3. **Update/Create Apply.jsx**
- Call `POST /api/v1/jobs/{job_id}/apply`
- Include cover letter textarea
- Include resume URL field
- Show success/error messages

### 4. **Update MyApplications.jsx**
- Call `GET /api/v1/my-applications`
- Display list of submitted applications
- Show application status
- Show date applied
- Allow filtering by status

### 5. **Create PostJobPage.jsx** (New for employers)
- Form to create job posting
- Call `POST /api/v1/jobs`
- Validate all fields
- Show success message and redirect

### 6. **Create ManageJobsPage.jsx** (New for employers)
- List all jobs posted by current employer
- Call `GET /api/v1/employers/{current_user_id}/jobs`
- Show job details
- Edit button → `PUT /api/v1/jobs/{job_id}`
- Delete button → `DELETE /api/v1/jobs/{job_id}`
- View applications button

### 7. **Create ViewApplicationsPage.jsx** (New for employers)
- List all applications for a specific job
- Call `GET /api/v1/jobs/{job_id}/applications`
- Show candidate details
- Update status → `PUT /api/v1/applications/{app_id}/status`
- Filter by application status

---

## Data Models

### JobPosting Response
```javascript
{
  id: 1,
  employer_id: 5,
  title: "Frontend Developer",
  description: "Build modern UIs...",
  company_name: "TechCorp",
  location: "Lagos, Nigeria",
  job_type: "Full-time",
  salary_min: 50000,
  salary_max: 150000,
  currency: "USD",
  required_skills: ["React", "TypeScript"],
  experience_level: "Mid-level",
  years_of_experience: 3,
  education_requirement: "Bachelor's",
  benefits: ["Health Insurance", "Remote"],
  remote_option: true,
  is_active: true,
  applications_count: 12,
  created_at: "2026-04-03T10:00:00Z",
  updated_at: "2026-04-03T10:00:00Z",
  deadline: "2026-05-31T23:59:59Z"
}
```

### JobApplication Response
```javascript
{
  id: 1,
  job_id: 1,
  candidate_id: 10,
  status: "applied", // or reviewed, shortlisted, rejected, accepted
  cover_letter: "I'm interested...",
  resume_url: "https://...",
  applied_at: "2026-04-03T15:30:00Z",
  updated_at: "2026-04-03T15:30:00Z"
}
```

---

## Role-Based Features

### Candidates Can:
- ✅ View all active job listings
- ✅ View job details
- ✅ Apply to jobs
- ✅ View their applications
- ✅ See application status updates

### Employers Can:
- ✅ Create job postings
- ✅ Edit their job postings
- ✅ Delete (deactivate) job postings
- ✅ View all their job postings
- ✅ View applications for each job
- ✅ Update application status
- ✅ View applicant details

---

## Implementation Checklist

### Frontend Tasks
- [ ] Update Jobs.jsx with API integration
- [ ] Update JobDetails.jsx with API integration
- [ ] Create/Update Apply.jsx with application logic
- [ ] Update MyApplications.jsx with API calls
- [ ] Create PostJobPage.jsx for job creation
- [ ] Create ManageJobsPage.jsx for job management
- [ ] Create ViewApplicationsPage.jsx for viewing applications
- [ ] Add routes for new pages in App.jsx
- [ ] Add navigation links in Navbar.jsx

### Testing Checklist
- [ ] Test creating a job posting as employer
- [ ] Test viewing all jobs as candidate
- [ ] Test job details page load
- [ ] Test applying to a job
- [ ] Test viewing my applications
- [ ] Test updating application status
- [ ] Test deleting a job posting
- [ ] Test role-based access control

---

## Example API Integration (React)

### Fetching Jobs
```jsx
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/jobs?skip=0&limit=20');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchJobs();
}, []);
```

### Creating a Job (Employer)
```jsx
const createJob = async (jobData) => {
  const { access_token } = getAuth();
  
  const response = await fetch('http://localhost:8000/api/v1/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(jobData),
  });
  
  return await response.json();
};
```

### Applying to Job (Candidate)
```jsx
const applyToJob = async (jobId, applicationData) => {
  const { access_token } = getAuth();
  
  const response = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: JSON.stringify(applicationData),
  });
  
  return await response.json();
};
```

---

## Notes

- All job-related data is now stored in the database
- Mock jobs have been completely removed
- Jobs are only created by authenticated employers
- All job applications require authentication
- Soft delete is used for job postings (is_active = false)
- Application count is automatically tracked
