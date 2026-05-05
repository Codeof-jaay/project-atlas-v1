import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, model_validator, EmailStr
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
import json
import asyncio
import aiohttp
from sqlmodel import Field, SQLModel, create_engine, Session, select, Relationship
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from enum import Enum
from dotenv import load_dotenv

# ===== Load Environment Variables =====
load_dotenv()

# ===== Logging Configuration =====
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Atlas Backend API",
    description="Comprehensive job platform backend with profile management",
    version="1.0.0"
)

# ===== CORS Configuration (Production-Ready) =====
# Get allowed origins from environment variable or use defaults

ALLOWED_ORIGINS = [
    "https://project-atlas-v1.vercel.app",
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# ===== Self-Ping Configuration =====
# Keep server awake by self-pinging every 4 minutes (prevents Render sleep)
PING_INTERVAL = 240  # 4 minutes in seconds
ping_task = None

async def self_ping():
    """Periodically ping the server to keep it awake."""
    await asyncio.sleep(10)  # Wait 10 seconds after startup before first ping
    
    while True:
        try:
            # Get server URL from environment or use default
            server_url = os.getenv("SERVER_URL", "http://localhost:8000")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{server_url}/", timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        logger.info(f"🔄 Self-ping successful (status: {response.status})")
                    else:
                        logger.warning(f"⚠️  Self-ping returned status {response.status}")
        except asyncio.TimeoutError:
            logger.warning("⚠️  Self-ping timeout - server may be slow")
        except Exception as e:
            logger.warning(f"⚠️  Self-ping failed: {str(e)}")
        
        # Wait for next ping interval
        await asyncio.sleep(PING_INTERVAL)

def start_ping_task():
    """Start the self-ping background task."""
    global ping_task
    ping_task = asyncio.create_task(self_ping())
    logger.info("🚀 Self-ping task started (10-minute interval)")

# ===== Database Setup =====
# Use PostgreSQL from environment, fallback to SQLite for development
database_url = os.getenv("DATABASE_URL")

if database_url:
    # PostgreSQL (Production or Remote Development)
    logger.info("🗄️ Using PostgreSQL database")
    
    # Convert postgresql:// to postgresql+psycopg2:// for SQLAlchemy
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    engine = create_engine(
        database_url,
        echo=False,
        pool_pre_ping=True,  # Test connection before using
        pool_size=10,
        max_overflow=20,
        connect_args={"sslmode": "require"}  # Require SSL for production
    )
else:
    # SQLite (Local Development Fallback)
    logger.info("🗄️ Using SQLite database (development)")
    engine = create_engine(
        "sqlite:///./database.db",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)

def create_db_and_tables():
    """Create database tables on startup."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {str(e)}")
        raise

def get_session():
    """Get database session."""
    with SessionLocal() as session:
        yield session

@app.on_event("startup")
def on_startup():
    """Initialize database and start self-ping on application startup."""
    create_db_and_tables()
    logger.info("✅ Database initialized on startup")
    seed_admin_users()
    start_ping_task()

def seed_admin_users():
    """Create default admin users if they don't exist."""
    session = SessionLocal()
    try:
        # Check if admin users exist
        admin_count = session.query(User).filter(User.role == "A").count()
        if admin_count > 0:
            return  # Admin users already exist
        
        # Create default admin users
        admin_users = [
            {
                "email": "admin@dashhr.com",
                "password": "AdminDashHR123!",
                "role": "A"
            },
            {
                "email": "admin@example.com",
                "password": "SecureAdmin456!",
                "role": "A"
            }
        ]
        
        for admin_data in admin_users:
            existing = session.query(User).filter(User.email == admin_data["email"]).first()
            if not existing:
                admin_user = User(
                    email=admin_data["email"],
                    hashed_password=AuthService.hash_password(admin_data["password"]),
                    role=admin_data["role"],
                    is_active=True
                )
                session.add(admin_user)
        
        session.commit()
        logger.info("✅ Admin users seeded")
    except Exception as e:
        logger.error(f"Error seeding admin users: {e}")
    finally:
        session.close()

# ===== Database Models =====

class UserRole(str, Enum):
    candidate = "C"
    employer = "R"
    admin = "A"


class User(SQLModel, table=True):
    """Base User model for authentication."""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="C")  # C=candidate, R=employer, A=admin
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships (Old system - backward compatibility)
    candidate_profile: Optional["CandidateProfile"] = Relationship(back_populates="user")
    employer_profile: Optional["EmployerProfile"] = Relationship(back_populates="user")
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")
    
    # Relationships (New comprehensive profiles)
    individual_profile: Optional["IndividualProfile"] = Relationship(back_populates="user")
    organization_profile_new: Optional["OrganizationProfile"] = Relationship(back_populates="user")
    
    # Job postings (for employers)
    job_postings: List["JobPosting"] = Relationship(back_populates="employer")


class CandidateProfile(SQLModel, table=True):
    """Candidate-specific profile data."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    full_name: str
    skills: str = Field(default="[]")  # JSON string
    experience_years: int = Field(default=0)
    education: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: User = Relationship(back_populates="candidate_profile")


class EmployerProfile(SQLModel, table=True):
    """Employer-specific profile data."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    company_name: str
    company_size: Optional[str] = None  # e.g., "1-10", "11-50", "51-200", etc
    industry: Optional[str] = None
    company_description: Optional[str] = None
    website: Optional[str] = None
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: User = Relationship(back_populates="employer_profile")


class RefreshToken(SQLModel, table=True):
    """Refresh token model for token rotation."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    token: str = Field(index=True, unique=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_revoked: bool = Field(default=False)
    
    # Relationship
    user: User = Relationship(back_populates="refresh_tokens")


# ===== NEW COMPREHENSIVE PROFILE MODELS =====
# These coexist with existing CandidateProfile/EmployerProfile for gradual migration

class IndividualProfile(SQLModel, table=True):
    """Comprehensive individual user profile."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    
    # Personal Info
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    profile_image_url: Optional[str] = None
    
    # Professional Info
    title: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    skills: str = Field(default="[]")  # JSON array
    experience: str = Field(default="[]")  # JSON array
    certifications: str = Field(default="[]")  # JSON array
    
    # Contact Preferences
    allow_email_notifications: bool = Field(default=True)
    allow_phone_notifications: bool = Field(default=False)
    preferred_contact_method: str = Field(default="email")
    
    # Social Links
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    portfolio: Optional[str] = None
    
    # Profile Completion
    completion_percentage: int = Field(default=0)
    completed_sections: str = Field(default="[]")  # JSON array
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated_by: Optional[int] = None
    
    # Relationship
    user: Optional[User] = Relationship(back_populates="individual_profile")


class OrganizationProfile(SQLModel, table=True):
    """Comprehensive organization user profile."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    organization_id: Optional[str] = None
    
    # Organization Info
    organization_name: str = Field(min_length=2, max_length=150)
    registration_number: str = Field(index=True, unique=True)
    registration_type: str
    founded_date: Optional[datetime] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    
    # Contact Info
    org_email: str = Field(index=True, unique=True)
    phone_number: str
    
    # Address (stored as JSON)
    address: str = Field(default="{}")  # JSON object
    
    # Organization Details
    description: str = Field(min_length=20, max_length=1000)
    mission: Optional[str] = Field(default=None, max_length=500)
    categories: str = Field(default="[]")  # JSON array
    team_size: Optional[str] = None
    primary_focus: str
    
    # Social Links
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    
    # Verification
    is_verified: bool = Field(default=False)
    verified_at: Optional[datetime] = None
    verification_documents: str = Field(default="[]")  # JSON array
    
    # Profile Completion
    completion_percentage: int = Field(default=0)
    completed_sections: str = Field(default="[]")  # JSON array
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated_by: Optional[int] = None
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="organization_profile_new")


class JobPosting(SQLModel, table=True):
    """Job posting created by employers."""
    id: Optional[int] = Field(default=None, primary_key=True)
    employer_id: int = Field(foreign_key="user.id", index=True)
    
    # Job Info
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=20, max_length=5000)
    company_name: str = Field(max_length=150)
    
    # Job Details
    location: str = Field(max_length=200)
    job_type: str = Field(default="Full-time")  # Full-time, Part-time, Contract, Temporary
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = Field(default="USD")
    
    # Requirements
    required_skills: str = Field(default="[]")  # JSON array
    experience_level: str = Field(default="Mid-level")  # Entry-level, Mid-level, Senior
    years_of_experience: Optional[int] = None
    education_requirement: Optional[str] = None
    
    # Additional Info
    benefits: str = Field(default="[]")  # JSON array
    remote_option: bool = Field(default=False)
    
    # Status
    is_active: bool = Field(default=True)
    applications_count: int = Field(default=0)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deadline: Optional[datetime] = None
    
    # Relationships
    employer: Optional[User] = Relationship(back_populates="job_postings")
    applications: List["JobApplication"] = Relationship(back_populates="job")


class JobApplication(SQLModel, table=True):
    """Job application submitted by candidates."""
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="jobposting.id", index=True)
    candidate_id: int = Field(foreign_key="user.id", index=True)
    
    # Application Info
    status: str = Field(default="applied")  # applied, reviewed, shortlisted, rejected, accepted
    cover_letter: Optional[str] = Field(default=None, max_length=2000)
    resume_url: Optional[str] = None
    
    # Metadata
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    job: Optional[JobPosting] = Relationship(back_populates="applications")
    candidate: Optional[User] = Relationship()


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "C"  # Default to candidate
    
    @model_validator(mode="after")
    def validate_email(self):
        if not self.email or "@" not in self.email:
            raise ValueError("Valid email is required")
        # Ensure role is valid
        if self.role not in ["C", "R", "A"]:
            raise ValueError("Invalid role. Must be C, R, or A")
        return self


class CandidateOnboardingRequest(BaseModel):
    full_name: str
    skills: Optional[List[str]] = None
    experience_years: int = 0
    education: Optional[str] = None
    bio: Optional[str] = None
    resume_url: Optional[str] = None


class EmployerOnboardingRequest(BaseModel):
    company_name: str
    company_size: Optional[str] = None
    industry: Optional[str] = None
    company_description: Optional[str] = None
    website: Optional[str] = None


class CandidateProfileResponse(BaseModel):
    id: int
    full_name: str
    skills: List[str]
    experience_years: int
    education: Optional[str]
    bio: Optional[str]
    resume_url: Optional[str]
    is_completed: bool


class EmployerProfileResponse(BaseModel):
    id: int
    company_name: str
    company_size: Optional[str]
    industry: Optional[str]
    company_description: Optional[str]
    website: Optional[str]
    is_completed: bool


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    onboarding_completed: bool
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing access token."""
    refresh_token: str


# ===== NEW COMPREHENSIVE PROFILE SCHEMAS =====

class IndividualProfileResponse(BaseModel):
    """Response model for individual profile."""
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone_number: Optional[str]
    date_of_birth: Optional[datetime]
    profile_image_url: Optional[str]
    title: Optional[str]
    bio: Optional[str]
    skills: List[str]
    linkedin: Optional[str]
    twitter: Optional[str]
    portfolio: Optional[str]
    completion_percentage: int
    completed_sections: List[str]


class IndividualProfileUpdateRequest(BaseModel):
    """Request model for updating individual profile."""
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    title: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    skills: Optional[List[str]] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    portfolio: Optional[str] = None


class OrganizationProfileResponse(BaseModel):
    """Response model for organization profile."""
    id: int
    user_id: int
    organization_name: str
    registration_type: str
    website: Optional[str]
    logo_url: Optional[str]
    cover_image_url: Optional[str]
    description: str
    mission: Optional[str]
    categories: List[str]
    team_size: Optional[str]
    is_verified: bool
    completion_percentage: int
    completed_sections: List[str]


class OrganizationProfileUpdateRequest(BaseModel):
    """Request model for updating organization profile."""
    organization_name: Optional[str] = Field(None, min_length=2, max_length=150)
    website: Optional[str] = None
    description: Optional[str] = Field(None, min_length=20, max_length=1000)
    mission: Optional[str] = Field(None, max_length=500)
    categories: Optional[List[str]] = None
    team_size: Optional[str] = None
    phone_number: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None


class ProfileCompletionResponse(BaseModel):
    """Profile completion metrics."""
    percentage: int
    completed_sections: List[str]
    next_sections: Optional[List[str]] = None


# ===== JOB POSTING SCHEMAS =====

class JobPostingCreateRequest(BaseModel):
    """Request model for creating a job posting."""
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=20, max_length=5000)
    company_name: str = Field(max_length=150)
    location: str = Field(max_length=200)
    job_type: str = Field(default="Full-time")
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = Field(default="USD")
    required_skills: Optional[List[str]] = None
    experience_level: str = Field(default="Mid-level")
    years_of_experience: Optional[int] = None
    education_requirement: Optional[str] = None
    benefits: Optional[List[str]] = None
    remote_option: bool = Field(default=False)
    deadline: Optional[datetime] = None


class JobPostingUpdateRequest(BaseModel):
    """Request model for updating a job posting."""
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, min_length=20, max_length=5000)
    location: Optional[str] = Field(None, max_length=200)
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    years_of_experience: Optional[int] = None
    education_requirement: Optional[str] = None
    benefits: Optional[List[str]] = None
    remote_option: Optional[bool] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None


class StatusUpdateRequest(BaseModel):
    """Request model for updating application status."""
    status: str = Field(min_length=1)


class JobPostingResponse(BaseModel):
    """Response model for job posting."""
    id: int
    employer_id: int
    title: str
    description: str
    company_name: str
    location: str
    job_type: str
    salary_min: Optional[int]
    salary_max: Optional[int]
    currency: str
    required_skills: List[str]
    experience_level: str
    years_of_experience: Optional[int]
    education_requirement: Optional[str]
    benefits: List[str]
    remote_option: bool
    is_active: bool
    applications_count: int
    created_at: datetime
    updated_at: datetime
    deadline: Optional[datetime]


class JobApplicationRequest(BaseModel):
    """Request model for job application."""
    cover_letter: Optional[str] = Field(None, max_length=2000)
    resume_url: Optional[str] = None


class JobApplicationResponse(BaseModel):
    """Response model for job application."""
    id: int
    job_id: int
    candidate_id: int
    status: str
    cover_letter: Optional[str]
    resume_url: Optional[str]
    applied_at: datetime
    updated_at: datetime

# ===== Authentication Config =====
SECRET_KEY = os.environ.get("SECRET_KEY", "your-super-secret-key")  # Use env var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ===== Authentication Service =====
class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password for storing.
        
        Note: Bcrypt has a 72-byte limit. We truncate manually to avoid
        silent truncation and ensure consistent hashing behavior.
        
        AUDIT LOG:
        - Validates input is a string (not dict, bytes, or request body)
        - Logs password length before and after truncation
        - Ensures only raw password string is hashed
        """
        try:
            # AUDIT CHECK 1: Verify input is string
            if not isinstance(password, str):
                logger.error(f"SECURITY AUDIT FAIL: password is type {type(password)}, not str")
                raise TypeError(f"Password must be string, got {type(password)}")
            
            # AUDIT CHECK 2: Log password length
            logger.info(f"[PASSWORD_HASH] Input password length: {len(password)} chars, {len(password.encode('utf-8'))} bytes")
            
            # Truncate password to 72 bytes if necessary
            password_bytes = password.encode('utf-8')
            original_length = len(password_bytes)
            
            if original_length > 72:
                logger.warning(f"[PASSWORD_HASH] Password exceeds 72 bytes ({original_length} bytes), truncating")
                # Safely truncate at byte boundary
                password = password_bytes[:72].decode('utf-8', errors='replace')
                new_length = len(password.encode('utf-8'))
                logger.info(f"[PASSWORD_HASH] After truncation: {new_length} bytes")
            
            # AUDIT CHECK 3: Verify we're not hashing something else
            logger.debug(f"[PASSWORD_HASH] Hashing string of length: {len(password)} chars")
            
            result = pwd_context.hash(password)
            logger.info(f"[PASSWORD_HASH] Successfully hashed password")
            return result
            
        except TypeError as te:
            logger.error(f"[PASSWORD_HASH] TypeError: {str(te)}")
            raise
        except Exception as e:
            logger.error(f"[PASSWORD_HASH] Hashing failed: {str(e)} (type: {type(e).__name__})")
            raise ValueError(f"Password hashing failed: {str(e)}")
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a stored password against one provided by user.
        
        Note: We apply the same 72-byte truncation as hash_password
        to ensure consistent verification.
        
        AUDIT LOG:
        - Validates both inputs are strings
        - Logs password length during verification
        - Ensures hashed_password is an actual hash (not plaintext)
        """
        try:
            # AUDIT CHECK 1: Verify inputs are strings
            if not isinstance(plain_password, str):
                logger.error(f"SECURITY AUDIT FAIL: plain_password is type {type(plain_password)}, not str")
                return False
            
            if not isinstance(hashed_password, str):
                logger.error(f"SECURITY AUDIT FAIL: hashed_password is type {type(hashed_password)}, not str")
                return False
            
            # AUDIT CHECK 2: Verify hashed_password looks like a bcrypt hash
            if not hashed_password.startswith('$2'):
                logger.warning(f"SECURITY AUDIT WARNING: hashed_password doesn't start with '$2' (bcrypt marker)")
            
            logger.debug(f"[PASSWORD_VERIFY] Input password length: {len(plain_password)} chars, {len(plain_password.encode('utf-8'))} bytes")
            
            # Truncate password to 72 bytes if necessary (same as hash_password)
            password_bytes = plain_password.encode('utf-8')
            if len(password_bytes) > 72:
                logger.warning(f"[PASSWORD_VERIFY] Password exceeds 72 bytes ({len(password_bytes)}), truncating")
                plain_password = password_bytes[:72].decode('utf-8', errors='replace')
            
            result = pwd_context.verify(plain_password, hashed_password)
            logger.debug(f"[PASSWORD_VERIFY] Verification result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[PASSWORD_VERIFY] Verification failed: {str(e)}")
            return False
    
    @staticmethod
    def create_user(session: Session, email: str, password: str, role: str = UserRole.candidate) -> User:
        """Create a new user in the database."""
        # Check if user already exists
        existing_user = session.exec(
            select(User).where(User.email == email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_pw = AuthService.hash_password(password)
        
        # Create the user object
        new_user = User(
            email=email,
            hashed_password=hashed_pw,
            role=role
        )
        
        # Save to database
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user
    
    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """Get user by email from database."""
        return session.exec(
            select(User).where(User.email == email)
        ).first()
    
    @staticmethod
    def create_access_token(email: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = {"sub": email}
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(session: Session, user_id: int) -> str:
        """Create refresh token and store in database."""
        # Generate refresh token
        refresh_token = jwt.encode(
            {
                "sub": str(user_id),
                "type": "refresh",
                "exp": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        # Store in database
        token_obj = RefreshToken(
            user_id=user_id,
            token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        session.add(token_obj)
        session.commit()
        
        return refresh_token
    
    @staticmethod
    def verify_refresh_token(session: Session, refresh_token: str) -> Optional[User]:
        """Verify refresh token and return user if valid."""
        try:
            # Check if token exists and is not revoked
            token_obj = session.exec(
                select(RefreshToken).where(
                    (RefreshToken.token == refresh_token) & 
                    (RefreshToken.is_revoked == False)
                )
            ).first()
            
            if not token_obj:
                return None
            
            # Check if token is expired
            if datetime.utcnow() > token_obj.expires_at:
                return None
            
            # Verify JWT signature
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: int = int(payload.get("sub"))
            
            # Get user from database
            user = session.get(User, user_id)
            return user if user and user.is_active else None
            
        except JWTError:
            return None
    
    @staticmethod
    def revoke_refresh_token(session: Session, refresh_token: str) -> bool:
        """Revoke a refresh token."""
        token_obj = session.exec(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        ).first()
        
        if token_obj:
            token_obj.is_revoked = True
            session.add(token_obj)
            session.commit()
            return True
        return False


# ===== Profile Service =====
class ProfileService:
    """Service for managing user profiles."""
    
    @staticmethod
    def create_or_update_candidate_profile(
        session: Session,
        user_id: int,
        full_name: str,
        skills: Optional[List[str]] = None,
        experience_years: int = 0,
        education: Optional[str] = None,
        bio: Optional[str] = None,
        resume_url: Optional[str] = None
    ) -> CandidateProfile:
        """Create or update candidate profile."""
        profile = session.exec(
            select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        ).first()
        
        skills_json = json.dumps(skills or [])
        
        if profile:
            profile.full_name = full_name
            profile.skills = skills_json
            profile.experience_years = experience_years
            profile.education = education
            profile.bio = bio
            profile.resume_url = resume_url
            profile.is_completed = True
            profile.updated_at = datetime.utcnow()
        else:
            profile = CandidateProfile(
                user_id=user_id,
                full_name=full_name,
                skills=skills_json,
                experience_years=experience_years,
                education=education,
                bio=bio,
                resume_url=resume_url,
                is_completed=True
            )
        
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    
    @staticmethod
    def create_or_update_employer_profile(
        session: Session,
        user_id: int,
        company_name: str,
        company_size: Optional[str] = None,
        industry: Optional[str] = None,
        company_description: Optional[str] = None,
        website: Optional[str] = None
    ) -> EmployerProfile:
        """Create or update employer profile."""
        profile = session.exec(
            select(EmployerProfile).where(EmployerProfile.user_id == user_id)
        ).first()
        
        if profile:
            profile.company_name = company_name
            profile.company_size = company_size
            profile.industry = industry
            profile.company_description = company_description
            profile.website = website
            profile.is_completed = True
            profile.updated_at = datetime.utcnow()
        else:
            profile = EmployerProfile(
                user_id=user_id,
                company_name=company_name,
                company_size=company_size,
                industry=industry,
                company_description=company_description,
                website=website,
                is_completed=True
            )
        
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    
    @staticmethod
    def get_candidate_profile(session: Session, user_id: int) -> Optional[CandidateProfile]:
        """Get candidate profile."""
        return session.exec(
            select(CandidateProfile).where(CandidateProfile.user_id == user_id)
        ).first()
    
    @staticmethod
    def get_employer_profile(session: Session, user_id: int) -> Optional[EmployerProfile]:
        """Get employer profile."""
        return session.exec(
            select(EmployerProfile).where(EmployerProfile.user_id == user_id)
        ).first()
    
    @staticmethod
    def is_onboarding_completed(session: Session, user: User) -> bool:
        """Check if user has completed onboarding."""
        if user.role == "C":  # Candidate
            profile = ProfileService.get_candidate_profile(session, user.id)
            return profile is not None and profile.is_completed
        elif user.role == "R":  # Employer/Recruiter
            profile = ProfileService.get_employer_profile(session, user.id)
            return profile is not None and profile.is_completed
        return True  # Admins don't need onboarding


# ===== COMPREHENSIVE PROFILE SERVICE =====
class ComprehensiveProfileService:
    """Service for managing comprehensive user profiles (new system)."""
    
    @staticmethod
    def create_or_update_individual_profile(
        session: Session,
        user_id: int,
        **kwargs
    ) -> IndividualProfile:
        """Create or update individual profile."""
        profile = session.exec(
            select(IndividualProfile).where(IndividualProfile.user_id == user_id)
        ).first()
        
        if profile:
            for key, value in kwargs.items():
                if value is not None:
                    if key in ['skills', 'experience', 'certifications', 'completed_sections']:
                        setattr(profile, key, json.dumps(value) if isinstance(value, list) else value)
                    else:
                        setattr(profile, key, value)
            if 'updated_at' not in kwargs:
                profile.updated_at = datetime.utcnow()
        else:
            # Convert lists to JSON strings
            for key in ['skills', 'experience', 'certifications', 'completed_sections']:
                if key in kwargs and isinstance(kwargs[key], list):
                    kwargs[key] = json.dumps(kwargs[key])
            
            # Don't set last_updated_by here - let caller set it
            profile = IndividualProfile(
                user_id=user_id,
                **kwargs
            )
        
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    
    @staticmethod
    def get_individual_profile(session: Session, user_id: int) -> Optional[IndividualProfile]:
        """Get individual profile."""
        return session.exec(
            select(IndividualProfile).where(IndividualProfile.user_id == user_id)
        ).first()
    
    @staticmethod
    def create_or_update_organization_profile(
        session: Session,
        user_id: int,
        **kwargs
    ) -> OrganizationProfile:
        """Create or update organization profile."""
        profile = session.exec(
            select(OrganizationProfile).where(OrganizationProfile.user_id == user_id)
        ).first()
        
        if profile:
            for key, value in kwargs.items():
                if value is not None:
                    if key in ['address', 'categories', 'verification_documents', 'completed_sections']:
                        setattr(profile, key, json.dumps(value) if isinstance(value, (dict, list)) else value)
                    else:
                        setattr(profile, key, value)
            if 'updated_at' not in kwargs:
                profile.updated_at = datetime.utcnow()
        else:
            for key in ['address', 'categories', 'verification_documents', 'completed_sections']:
                if key in kwargs and isinstance(kwargs[key], (dict, list)):
                    kwargs[key] = json.dumps(kwargs[key])
            
            # Don't set last_updated_by here - let caller set it
            profile = OrganizationProfile(
                user_id=user_id,
                **kwargs
            )
        
        session.add(profile)
        session.commit()
        session.refresh(profile)
        return profile
    
    @staticmethod
    def get_organization_profile(session: Session, user_id: int) -> Optional[OrganizationProfile]:
        """Get organization profile."""
        return session.exec(
            select(OrganizationProfile).where(OrganizationProfile.user_id == user_id)
        ).first()

# ===== Mock Database =====
# Jobs are now created by actual employers through API
# Mock database cleared - all jobs are database-driven now

applications = []

# ===== Authentication Helpers =====
def get_password_hash(password):
    """Hash a password for storing.
    
    AUDIT: This is a standalone helper - prefer using AuthService.hash_password()
    """
    try:
        if not isinstance(password, str):
            logger.error(f"SECURITY AUDIT FAIL: get_password_hash received {type(password)}, not str")
            raise TypeError(f"Password must be string, got {type(password)}")
        
        logger.info(f"[GET_PASSWORD_HASH] Input length: {len(password)} chars, {len(password.encode('utf-8'))} bytes")
        
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            logger.warning(f"[GET_PASSWORD_HASH] Truncating password from {len(password_bytes)} bytes to 72")
            password = password_bytes[:72].decode('utf-8', errors='replace')
        
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"[GET_PASSWORD_HASH] Failed: {str(e)}")
        raise ValueError(f"Password hashing failed: {str(e)}")

def verify_password(plain_password, hashed_password):
    """Verify a stored password against one provided by user.
    
    AUDIT: This is a standalone helper - prefer using AuthService.verify_password()
    """
    try:
        if not isinstance(plain_password, str):
            logger.error(f"SECURITY AUDIT FAIL: verify_password received {type(plain_password)}, not str")
            return False
        
        if not isinstance(hashed_password, str):
            logger.error(f"SECURITY AUDIT FAIL: hashed_password is {type(hashed_password)}, not str")
            return False
        
        logger.debug(f"[VERIFY_PASSWORD] Input length: {len(plain_password)} chars")
        
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            logger.warning(f"[VERIFY_PASSWORD] Truncating from {len(password_bytes)} bytes to 72")
            plain_password = password_bytes[:72].decode('utf-8', errors='replace')
        
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"[VERIFY_PASSWORD] Failed: {str(e)}")
        return False

# ===== Routes =====

@app.post("/login")
async def login(data: RegisterRequest, session: Session = Depends(get_session)):
    """Login endpoint - returns JWT access token and refresh token."""
    # Get user from database
    user = AuthService.get_user_by_email(session, data.email)
    
    if not user or not AuthService.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = AuthService.create_access_token(user.email)
    refresh_token = AuthService.create_refresh_token(session, user.id)
    
    # Check if onboarding is completed
    onboarding_completed = ProfileService.is_onboarding_completed(session, user)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role,
        "onboarding_completed": onboarding_completed,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # in seconds
    }

@app.post("/register")
async def register(data: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user (only creates User record, NOT profile)."""
    try:
        user = AuthService.create_user(
            session,
            email=data.email,
            password=data.password,
            role=data.role)
        return {
            "message": "User registered successfully",
            "email": user.email,
            "role": user.role,
            "onboarding_completed": False,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/refresh")
async def refresh(data: RefreshTokenRequest, session: Session = Depends(get_session)):
    """Refresh access token using refresh token."""
    # Verify refresh token
    user = AuthService.verify_refresh_token(session, data.refresh_token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    new_access_token = AuthService.create_access_token(user.email)
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # in seconds
    }

@app.post("/logout")
async def logout(data: RefreshTokenRequest, session: Session = Depends(get_session)):
    """Logout endpoint - client-side logout without revoking tokens.
    
    Note: We no longer revoke refresh tokens server-side. Logout is now
    client-side only - the client deletes their tokens from localStorage/cookies.
    This allows users to maintain sessions across devices and app restarts.
    """
    # Simply acknowledge the logout request
    # The client is responsible for deleting tokens locally
    return {"message": "Logged out successfully"}

# ===== JWT Token Extraction Helper =====
async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    """Extract user ID from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
        # Get user from database
        user = AuthService.get_user_by_email(session, email)
        if user is None:
            raise credentials_exception
            
        return user
        
    except JWTError:
        raise credentials_exception

# ===== PHASE 2: COMPREHENSIVE PROFILE ENDPOINTS =====

# ===== CURRENT USER ENDPOINT =====

@app.get("/api/v1/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current logged-in user's information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

# ===== ADMIN ENDPOINTS =====

def admin_only(current_user: User = Depends(get_current_user)):
    """Verify user is admin."""
    if current_user.role != "A":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@app.get("/api/v1/admin/analytics")
async def get_admin_analytics(
    admin: User = Depends(admin_only),
    session: Session = Depends(get_session)
):
    """Get platform analytics for admin dashboard."""
    total_users = session.query(User).count()
    total_candidates = session.query(User).filter(User.role == "C").count()
    total_employers = session.query(User).filter(User.role == "R").count()
    total_jobs = session.query(JobPosting).count()
    total_applications = session.query(JobApplication).count()
    active_jobs = session.query(JobPosting).filter(JobPosting.is_active == True).count()
    
    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_employers": total_employers,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications
    }

@app.get("/api/v1/admin/users")
async def get_all_users(
    admin: User = Depends(admin_only),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50
):
    """Get all users (paginated)."""
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@app.put("/api/v1/admin/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_update: dict,
    admin: User = Depends(admin_only),
    session: Session = Depends(get_session)
):
    """Ban/unban a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = status_update.get("is_active", user.is_active)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active
    }

@app.get("/api/v1/admin/jobs")
async def get_all_jobs_admin(
    admin: User = Depends(admin_only),
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 50
):
    """Get all jobs for admin review."""
    jobs = session.exec(select(JobPosting).offset(skip).limit(limit)).all()
    return [
        {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "employer_id": job.employer_id,
            "is_active": job.is_active,
            "applications_count": job.applications_count,
            "created_at": job.created_at
        }
        for job in jobs
    ]

@app.delete("/api/v1/admin/jobs/{job_id}")
async def delete_job_admin(
    job_id: int,
    admin: User = Depends(admin_only),
    session: Session = Depends(get_session)
):
    """Remove a job posting."""
    job = session.get(JobPosting, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    session.delete(job)
    session.commit()
    
    return {"message": "Job deleted successfully"}

# ===== INDIVIDUAL PROFILE ENDPOINTS =====

@app.get("/api/v1/profile/individual")
async def get_individual_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's individual profile."""
    profile = ComprehensiveProfileService.get_individual_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return IndividualProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        phone_number=profile.phone_number,
        date_of_birth=profile.date_of_birth,
        profile_image_url=profile.profile_image_url,
        title=profile.title,
        bio=profile.bio,
        skills=json.loads(profile.skills) if profile.skills else [],
        experience=json.loads(profile.experience) if profile.experience else [],
        certifications=json.loads(profile.certifications) if profile.certifications else [],
        allow_email_notifications=profile.allow_email_notifications,
        allow_phone_notifications=profile.allow_phone_notifications,
        preferred_contact_method=profile.preferred_contact_method,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        portfolio=profile.portfolio,
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.put("/api/v1/profile/individual")
async def update_individual_profile(
    data: IndividualProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's individual profile."""
    update_data = data.dict(exclude_unset=True)
    
    # Convert lists to JSON strings
    if "skills" in update_data:
        update_data["skills"] = json.dumps(update_data["skills"])
    if "experience" in update_data:
        update_data["experience"] = json.dumps(update_data["experience"])
    if "certifications" in update_data:
        update_data["certifications"] = json.dumps(update_data["certifications"])
    if "completed_sections" in update_data:
        update_data["completed_sections"] = json.dumps(update_data["completed_sections"])
    
    # Add metadata
    update_data["last_updated_by"] = current_user.id
    update_data["updated_at"] = datetime.utcnow()
    
    profile = ComprehensiveProfileService.create_or_update_individual_profile(
        session, current_user.id, **update_data
    )
    
    return IndividualProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        phone_number=profile.phone_number,
        date_of_birth=profile.date_of_birth,
        profile_image_url=profile.profile_image_url,
        title=profile.title,
        bio=profile.bio,
        skills=json.loads(profile.skills) if profile.skills else [],
        experience=json.loads(profile.experience) if profile.experience else [],
        certifications=json.loads(profile.certifications) if profile.certifications else [],
        allow_email_notifications=profile.allow_email_notifications,
        allow_phone_notifications=profile.allow_phone_notifications,
        preferred_contact_method=profile.preferred_contact_method,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        portfolio=profile.portfolio,
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.patch("/api/v1/profile/individual/section/{section_name}")
async def update_individual_profile_section(
    section_name: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update specific section of individual profile."""
    valid_sections = ["personalInfo", "professionalInfo", "contactPreferences", "socialLinks"]
    
    if section_name not in valid_sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid section. Must be one of: {', '.join(valid_sections)}"
        )
    
    profile = ComprehensiveProfileService.get_individual_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Map section names to fields
    section_mapping = {
        "personalInfo": ["first_name", "last_name", "phone_number", "date_of_birth", "profile_image_url"],
        "professionalInfo": ["title", "bio", "skills", "experience", "certifications"],
        "contactPreferences": ["allow_email_notifications", "allow_phone_notifications", "preferred_contact_method"],
        "socialLinks": ["linkedin", "twitter", "portfolio"]
    }
    
    # Get the fields for this section
    section_fields = section_mapping.get(section_name, [])
    
    # Build update data
    update_data = {k: v for k, v in data.items() if k in section_fields}
    
    # Convert lists to JSON strings
    if "skills" in update_data:
        update_data["skills"] = json.dumps(update_data["skills"])
    if "experience" in update_data:
        update_data["experience"] = json.dumps(update_data["experience"])
    if "certifications" in update_data:
        update_data["certifications"] = json.dumps(update_data["certifications"])
    
    # Add metadata
    update_data["last_updated_by"] = current_user.id
    update_data["updated_at"] = datetime.utcnow()
    
    # Update completed sections
    completed = json.loads(profile.completed_sections) if profile.completed_sections else []
    if section_name not in completed:
        completed.append(section_name)
        update_data["completed_sections"] = json.dumps(completed)
    
    profile = ComprehensiveProfileService.create_or_update_individual_profile(
        session, current_user.id, **update_data
    )
    
    return IndividualProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        phone_number=profile.phone_number,
        date_of_birth=profile.date_of_birth,
        profile_image_url=profile.profile_image_url,
        title=profile.title,
        bio=profile.bio,
        skills=json.loads(profile.skills) if profile.skills else [],
        experience=json.loads(profile.experience) if profile.experience else [],
        certifications=json.loads(profile.certifications) if profile.certifications else [],
        allow_email_notifications=profile.allow_email_notifications,
        allow_phone_notifications=profile.allow_phone_notifications,
        preferred_contact_method=profile.preferred_contact_method,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        portfolio=profile.portfolio,
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.get("/api/v1/profile/individual/completion")
async def get_individual_profile_completion(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get individual profile completion metrics."""
    profile = ComprehensiveProfileService.get_individual_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    completed = json.loads(profile.completed_sections) if profile.completed_sections else []
    all_sections = ["personalInfo", "professionalInfo", "contactPreferences", "socialLinks"]
    next_sections = [s for s in all_sections if s not in completed]
    
    return ProfileCompletionResponse(
        percentage=profile.completion_percentage,
        completed_sections=completed,
        next_sections=next_sections
    )

# ===== ORGANIZATION PROFILE ENDPOINTS =====

@app.get("/api/v1/profile/organization")
async def get_organization_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's organization profile."""
    profile = ComprehensiveProfileService.get_organization_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    address = json.loads(profile.address) if profile.address else {}
    
    return OrganizationProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        organization_name=profile.organization_name,
        registration_number=profile.registration_number,
        registration_type=profile.registration_type,
        founded_date=profile.founded_date,
        website=profile.website,
        logo_url=profile.logo_url,
        cover_image_url=profile.cover_image_url,
        org_email=profile.org_email,
        phone_number=profile.phone_number,
        address=address,
        description=profile.description,
        mission=profile.mission,
        categories=json.loads(profile.categories) if profile.categories else [],
        team_size=profile.team_size,
        primary_focus=profile.primary_focus,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        facebook=profile.facebook,
        is_verified=profile.is_verified,
        verified_at=profile.verified_at,
        verification_documents=json.loads(profile.verification_documents) if profile.verification_documents else [],
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.put("/api/v1/profile/organization")
async def update_organization_profile(
    data: OrganizationProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's organization profile."""
    update_data = data.dict(exclude_unset=True)
    
    # Convert complex types to JSON strings
    if "address" in update_data:
        update_data["address"] = json.dumps(update_data["address"])
    if "categories" in update_data:
        update_data["categories"] = json.dumps(update_data["categories"])
    if "verification_documents" in update_data:
        update_data["verification_documents"] = json.dumps(update_data["verification_documents"])
    if "completed_sections" in update_data:
        update_data["completed_sections"] = json.dumps(update_data["completed_sections"])
    
    # Add metadata
    update_data["last_updated_by"] = current_user.id
    update_data["updated_at"] = datetime.utcnow()
    
    profile = ComprehensiveProfileService.create_or_update_organization_profile(
        session, current_user.id, **update_data
    )
    
    address = json.loads(profile.address) if profile.address else {}
    
    return OrganizationProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        organization_name=profile.organization_name,
        registration_number=profile.registration_number,
        registration_type=profile.registration_type,
        founded_date=profile.founded_date,
        website=profile.website,
        logo_url=profile.logo_url,
        cover_image_url=profile.cover_image_url,
        org_email=profile.org_email,
        phone_number=profile.phone_number,
        address=address,
        description=profile.description,
        mission=profile.mission,
        categories=json.loads(profile.categories) if profile.categories else [],
        team_size=profile.team_size,
        primary_focus=profile.primary_focus,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        facebook=profile.facebook,
        is_verified=profile.is_verified,
        verified_at=profile.verified_at,
        verification_documents=json.loads(profile.verification_documents) if profile.verification_documents else [],
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.patch("/api/v1/profile/organization/section/{section_name}")
async def update_organization_profile_section(
    section_name: str,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update specific section of organization profile."""
    valid_sections = ["organizationInfo", "contactInfo", "organizationDetails", "socialLinks"]
    
    if section_name not in valid_sections:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid section. Must be one of: {', '.join(valid_sections)}"
        )
    
    profile = ComprehensiveProfileService.get_organization_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Map section names to fields
    section_mapping = {
        "organizationInfo": ["organization_name", "registration_type", "founded_date", "website", "logo_url", "cover_image_url"],
        "contactInfo": ["org_email", "phone_number", "address"],
        "organizationDetails": ["description", "mission", "categories", "team_size", "primary_focus"],
        "socialLinks": ["linkedin", "twitter", "facebook"]
    }
    
    # Get the fields for this section
    section_fields = section_mapping.get(section_name, [])
    
    # Build update data
    update_data = {k: v for k, v in data.items() if k in section_fields}
    
    # Convert complex types to JSON strings
    if "address" in update_data:
        update_data["address"] = json.dumps(update_data["address"])
    if "categories" in update_data:
        update_data["categories"] = json.dumps(update_data["categories"])
    
    # Add metadata
    update_data["last_updated_by"] = current_user.id
    update_data["updated_at"] = datetime.utcnow()
    
    # Update completed sections
    completed = json.loads(profile.completed_sections) if profile.completed_sections else []
    if section_name not in completed:
        completed.append(section_name)
        update_data["completed_sections"] = json.dumps(completed)
    
    profile = ComprehensiveProfileService.create_or_update_organization_profile(
        session, current_user.id, **update_data
    )
    
    address = json.loads(profile.address) if profile.address else {}
    
    return OrganizationProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        organization_name=profile.organization_name,
        registration_number=profile.registration_number,
        registration_type=profile.registration_type,
        founded_date=profile.founded_date,
        website=profile.website,
        logo_url=profile.logo_url,
        cover_image_url=profile.cover_image_url,
        org_email=profile.org_email,
        phone_number=profile.phone_number,
        address=address,
        description=profile.description,
        mission=profile.mission,
        categories=json.loads(profile.categories) if profile.categories else [],
        team_size=profile.team_size,
        primary_focus=profile.primary_focus,
        linkedin=profile.linkedin,
        twitter=profile.twitter,
        facebook=profile.facebook,
        is_verified=profile.is_verified,
        verified_at=profile.verified_at,
        verification_documents=json.loads(profile.verification_documents) if profile.verification_documents else [],
        completion_percentage=profile.completion_percentage,
        completed_sections=json.loads(profile.completed_sections) if profile.completed_sections else [],
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@app.get("/api/v1/profile/organization/completion")
async def get_organization_profile_completion(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get organization profile completion metrics."""
    profile = ComprehensiveProfileService.get_organization_profile(session, current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    completed = json.loads(profile.completed_sections) if profile.completed_sections else []
    all_sections = ["organizationInfo", "contactInfo", "organizationDetails", "socialLinks"]
    next_sections = [s for s in all_sections if s not in completed]
    
    return ProfileCompletionResponse(
        percentage=profile.completion_percentage,
        completed_sections=completed,
        next_sections=next_sections
    )

@app.post("/onboarding/candidate")
async def onboard_candidate(
    data: CandidateOnboardingRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create or update candidate profile (onboarding)."""
    try:
        profile = ProfileService.create_or_update_candidate_profile(
            session,
            user_id=current_user.id,
            full_name=data.full_name,
            skills=data.skills,
            experience_years=data.experience_years,
            education=data.education,
            bio=data.bio,
            resume_url=data.resume_url
        )
        session.commit()
        
        return {
            "message": "Candidate profile completed",
            "profile": CandidateProfileResponse(
                id=profile.id,
                full_name=profile.full_name,
                skills=json.loads(profile.skills),
                experience_years=profile.experience_years,
                education=profile.education,
                bio=profile.bio,
                resume_url=profile.resume_url,
                is_completed=profile.is_completed
            )
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/onboarding/employer")
async def onboard_employer(
    data: EmployerOnboardingRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create or update employer profile (onboarding)."""
    try:
        profile = ProfileService.create_or_update_employer_profile(
            session,
            user_id=current_user.id,
            company_name=data.company_name,
            company_size=data.company_size,
            industry=data.industry,
            company_description=data.company_description,
            website=data.website
        )
        session.commit()
        
        return {
            "message": "Employer profile completed",
            "profile": EmployerProfileResponse(
                id=profile.id,
                company_name=profile.company_name,
                company_size=profile.company_size,
                industry=profile.industry,
                company_description=profile.company_description,
                website=profile.website,
                is_completed=profile.is_completed
            )
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/")
def root():
    return {"message": "DashHR API running"}

# ===== JOB POSTING ENDPOINTS =====

@app.post("/api/v1/jobs")
async def create_job_posting(
    data: JobPostingCreateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new job posting (Employer only)."""
    if current_user.role != "R":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job postings"
        )
    
    try:
        job = JobPosting(
            employer_id=current_user.id,
            title=data.title,
            description=data.description,
            company_name=data.company_name,
            location=data.location,
            job_type=data.job_type,
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            currency=data.currency,
            required_skills=json.dumps(data.required_skills or []),
            experience_level=data.experience_level,
            years_of_experience=data.years_of_experience,
            education_requirement=data.education_requirement,
            benefits=json.dumps(data.benefits or []),
            remote_option=data.remote_option,
            deadline=data.deadline,
            is_active=True
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        
        return JobPostingResponse(
            id=job.id,
            employer_id=job.employer_id,
            title=job.title,
            description=job.description,
            company_name=job.company_name,
            location=job.location,
            job_type=job.job_type,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            required_skills=json.loads(job.required_skills),
            experience_level=job.experience_level,
            years_of_experience=job.years_of_experience,
            education_requirement=job.education_requirement,
            benefits=json.loads(job.benefits),
            remote_option=job.remote_option,
            is_active=job.is_active,
            applications_count=job.applications_count,
            created_at=job.created_at,
            updated_at=job.updated_at,
            deadline=job.deadline
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/v1/jobs")
async def get_all_jobs(
    skip: int = 0,
    limit: int = 20,
    session: Session = Depends(get_session)
):
    """Get all active job postings (public endpoint)."""
    try:
        jobs = session.exec(
            select(JobPosting)
            .where(JobPosting.is_active == True)
            .offset(skip)
            .limit(limit)
        ).all()
        
        return [
            JobPostingResponse(
                id=job.id,
                employer_id=job.employer_id,
                title=job.title,
                description=job.description,
                company_name=job.company_name,
                location=job.location,
                job_type=job.job_type,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                currency=job.currency,
                required_skills=json.loads(job.required_skills),
                experience_level=job.experience_level,
                years_of_experience=job.years_of_experience,
                education_requirement=job.education_requirement,
                benefits=json.loads(job.benefits),
                remote_option=job.remote_option,
                is_active=job.is_active,
                applications_count=job.applications_count,
                created_at=job.created_at,
                updated_at=job.updated_at,
                deadline=job.deadline
            )
            for job in jobs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/v1/jobs/{job_id}")
async def get_job_by_id(
    job_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific job posting."""
    try:
        job = session.get(JobPosting, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        return JobPostingResponse(
            id=job.id,
            employer_id=job.employer_id,
            title=job.title,
            description=job.description,
            company_name=job.company_name,
            location=job.location,
            job_type=job.job_type,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            required_skills=json.loads(job.required_skills),
            experience_level=job.experience_level,
            years_of_experience=job.years_of_experience,
            education_requirement=job.education_requirement,
            benefits=json.loads(job.benefits),
            remote_option=job.remote_option,
            is_active=job.is_active,
            applications_count=job.applications_count,
            created_at=job.created_at,
            updated_at=job.updated_at,
            deadline=job.deadline
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.put("/api/v1/jobs/{job_id}")
async def update_job_posting(
    job_id: int,
    data: JobPostingUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a job posting (Employer only)."""
    try:
        job = session.get(JobPosting, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        if job.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own job postings"
            )
        
        # Update fields
        update_data = data.dict(exclude_unset=True)
        
        if "required_skills" in update_data:
            update_data["required_skills"] = json.dumps(update_data["required_skills"])
        if "benefits" in update_data:
            update_data["benefits"] = json.dumps(update_data["benefits"])
        
        for key, value in update_data.items():
            setattr(job, key, value)
        
        job.updated_at = datetime.utcnow()
        session.add(job)
        session.commit()
        session.refresh(job)
        
        return JobPostingResponse(
            id=job.id,
            employer_id=job.employer_id,
            title=job.title,
            description=job.description,
            company_name=job.company_name,
            location=job.location,
            job_type=job.job_type,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            currency=job.currency,
            required_skills=json.loads(job.required_skills),
            experience_level=job.experience_level,
            years_of_experience=job.years_of_experience,
            education_requirement=job.education_requirement,
            benefits=json.loads(job.benefits),
            remote_option=job.remote_option,
            is_active=job.is_active,
            applications_count=job.applications_count,
            created_at=job.created_at,
            updated_at=job.updated_at,
            deadline=job.deadline
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.delete("/api/v1/jobs/{job_id}")
async def delete_job_posting(
    job_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete/Archive a job posting (Employer only)."""
    try:
        job = session.get(JobPosting, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        if job.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own job postings"
            )
        
        job.is_active = False
        session.add(job)
        session.commit()
        
        return {"message": "Job posting deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/v1/employers/{employer_id}/jobs")
async def get_employer_jobs(
    employer_id: int,
    session: Session = Depends(get_session)
):
    """Get all job postings from a specific employer."""
    try:
        jobs = session.exec(
            select(JobPosting)
            .where((JobPosting.employer_id == employer_id) & (JobPosting.is_active == True))
        ).all()
        
        return [
            JobPostingResponse(
                id=job.id,
                employer_id=job.employer_id,
                title=job.title,
                description=job.description,
                company_name=job.company_name,
                location=job.location,
                job_type=job.job_type,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                currency=job.currency,
                required_skills=json.loads(job.required_skills),
                experience_level=job.experience_level,
                years_of_experience=job.years_of_experience,
                education_requirement=job.education_requirement,
                benefits=json.loads(job.benefits),
                remote_option=job.remote_option,
                is_active=job.is_active,
                applications_count=job.applications_count,
                created_at=job.created_at,
                updated_at=job.updated_at,
                deadline=job.deadline
            )
            for job in jobs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.post("/api/v1/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: int,
    data: JobApplicationRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Apply to a job posting (Candidate only)."""
    if current_user.role != "C":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can apply to jobs"
        )
    
    try:
        job = session.get(JobPosting, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        if not job.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This job posting is no longer active"
            )
        
        # Check if already applied
        existing_application = session.exec(
            select(JobApplication)
            .where(
                (JobApplication.job_id == job_id) &
                (JobApplication.candidate_id == current_user.id)
            )
        ).first()
        
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already applied to this job"
            )
        
        application = JobApplication(
            job_id=job_id,
            candidate_id=current_user.id,
            cover_letter=data.cover_letter,
            resume_url=data.resume_url,
            status="applied"
        )
        
        session.add(application)
        job.applications_count += 1
        session.add(job)
        session.commit()
        session.refresh(application)
        
        return JobApplicationResponse(
            id=application.id,
            job_id=application.job_id,
            candidate_id=application.candidate_id,
            status=application.status,
            cover_letter=application.cover_letter,
            resume_url=application.resume_url,
            applied_at=application.applied_at,
            updated_at=application.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/v1/my-applications")
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all applications submitted by the current candidate."""
    if current_user.role != "C":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can view their applications"
        )
    
    try:
        applications = session.exec(
            select(JobApplication)
            .where(JobApplication.candidate_id == current_user.id)
        ).all()
        
        return [
            JobApplicationResponse(
                id=app.id,
                job_id=app.job_id,
                candidate_id=app.candidate_id,
                status=app.status,
                cover_letter=app.cover_letter,
                resume_url=app.resume_url,
                applied_at=app.applied_at,
                updated_at=app.updated_at
            )
            for app in applications
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/v1/jobs/{job_id}/applications")
async def get_job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all applications for a job posting (Employer only)."""
    try:
        job = session.get(JobPosting, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job posting not found"
            )
        
        if job.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view applications for your own job postings"
            )
        
        applications = session.exec(
            select(JobApplication)
            .where(JobApplication.job_id == job_id)
        ).all()
        
        return [
            JobApplicationResponse(
                id=app.id,
                job_id=app.job_id,
                candidate_id=app.candidate_id,
                status=app.status,
                cover_letter=app.cover_letter,
                resume_url=app.resume_url,
                applied_at=app.applied_at,
                updated_at=app.updated_at
            )
            for app in applications
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.put("/api/v1/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_update: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update application status (Employer only)."""
    try:
        application = session.get(JobApplication, application_id)
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        job = session.get(JobPosting, application.job_id)
        
        if job.employer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update applications for your own job postings"
            )
        
        new_status = status_update.status.lower()
        
        valid_statuses = ["applied", "reviewed", "shortlisted", "rejected", "accepted"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        application.status = new_status
        application.updated_at = datetime.utcnow()
        session.add(application)
        session.commit()
        session.refresh(application)
        
        return JobApplicationResponse(
            id=application.id,
            job_id=application.job_id,
            candidate_id=application.candidate_id,
            status=application.status,
            cover_letter=application.cover_letter,
            resume_url=application.resume_url,
            applied_at=application.applied_at,
            updated_at=application.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ===== Server Configuration =====
port = int(os.environ.get("PORT", 8000))
host = os.environ.get("HOST", "0.0.0.0")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=host, port=port, reload=False)