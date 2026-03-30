import os
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
from sqlmodel import Field, SQLModel, create_engine, Session, select, Relationship
from sqlalchemy.orm import sessionmaker
from enum import Enum

app = FastAPI()

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # React dev server (no trailing slash)
        "http://localhost:3000",      # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Database Setup =====
sqlite_url = "sqlite:///./database.db"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)

def create_db_and_tables():
    """Create database tables on startup."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session."""
    with SessionLocal() as session:
        yield session

@app.on_event("startup")
def on_startup():
    """Initialize database on application startup."""
    create_db_and_tables()

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
    
    # Relationship
    user: Optional[User] = Relationship(back_populates="organization_profile_new")


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
        """Hash a password for storing."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a stored password against one provided by user."""
        return pwd_context.verify(plain_password, hashed_password)
    
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
jobs = [
    {
        "id": "1",
        "title": "Frontend Developer",
        "company": "DashHR",
        "location": "Lagos",
        "description": "Build modern UIs"
    },
    {
        "id": "2",
        "title": "Backend Engineer",
        "company": "DashHR",
        "location": "Remote",
        "description": "Build APIs with FastAPI"
    }
]

applications = []

# ===== Authentication Helpers =====
def get_password_hash(password):
    """Hash a password for storing."""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Verify a stored password against one provided by user."""
    return pwd_context.verify(plain_password, hashed_password)

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
    """Logout - revoke refresh token."""
    success = AuthService.revoke_refresh_token(session, data.refresh_token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token"
        )
    
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

# Get all jobs
@app.get("/jobs")
def get_jobs():
    return jobs

# Get single job
@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    for job in jobs:
        if job["id"] == job_id:
            return job
    return {"error": "Job not found"}

# Apply to job
@app.post("/apply/{job_id}")
async def apply(
    job_id: str,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    cv: UploadFile = File(...)
):
    application_id = str(uuid.uuid4())

    application = {
        "id": application_id,
        "job_id": job_id,
        "name": name,
        "email": email,
        "phone": phone,
        "cv_filename": cv.filename,
        "status": "Applied"
    }

    applications.append(application)

    return {"message": "Application submitted", "application": application}

# Get all applications (candidate view)
@app.get("/applications")
def get_applications():
    return applications

# Update application status (ATS)
@app.put("/applications/{app_id}")
def update_status(app_id: str, status: str):
    for app_item in applications:
        if app_item["id"] == app_id:
            app_item["status"] = status
            return {"message": "Updated", "application": app_item}

    return {"error": "Application not found"}


port = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)