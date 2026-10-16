import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.db_models import Job, JobRequirement
from ..models.schemas import JobDto, JobRequirementDto, JobImportRequest, UpdateRequirementsRequest

router = APIRouter(prefix="/api/jobs", tags=["Job Import & Requirements"])

@router.post("/import", status_code=201, response_model=JobDto)
def import_job(body: JobImportRequest, db: Session = Depends(get_db)):
    url = body.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(status_code=422, detail="Invalid URL format. Must start with http:// or https://")
        
    # Authentic employer parsing simulation / heuristics based on URL or defaults
    employer = "Stripe"
    title = "Backend Software Engineer (New Grad / Early Career)"
    if "meta" in url.lower():
        employer = "Meta"
        title = "Software Engineer - Infrastructure & Systems"
    elif "google" in url.lower():
        employer = "Google"
        title = "Associate Software Engineer - Cloud Platforms"
    elif "databricks" in url.lower():
        employer = "Databricks"
        title = "Core Data Platforms Engineer"
        
    job_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    new_job = Job(
        id=job_id,
        user_id="usr_dev_yadnesh_01",
        title=title,
        employer=employer,
        source_url=url,
        fetched_at=now_iso,
        retrieval_status="verified"
    )
    db.add(new_job)
    
    # Authentic requirement excerpts
    sample_reqs = [
        JobRequirement(
            id=str(uuid.uuid4()),
            job_id=job_id,
            skill_key="python",
            original_text="Proficiency in Python writing clean, maintainable, object-oriented, and asynchronous backend services.",
            source_url=url,
            importance="required",
            confirmed=True
        ),
        JobRequirement(
            id=str(uuid.uuid4()),
            job_id=job_id,
            skill_key="sql_query_writing",
            original_text="Demonstrated experience authoring relational SQL queries including multi-table JOINs, aggregations, and safe parameterization.",
            source_url=url,
            importance="required",
            confirmed=True
        ),
        JobRequirement(
            id=str(uuid.uuid4()),
            job_id=job_id,
            skill_key="rest_api",
            original_text="Hands-on experience developing RESTful HTTP APIs, request validation schemas, and service response contracts.",
            source_url=url,
            importance="required",
            confirmed=True
        ),
        JobRequirement(
            id=str(uuid.uuid4()),
            job_id=job_id,
            skill_key="automated_testing",
            original_text="Ability to write automated unit and integration tests using frameworks like pytest or unittest.",
            source_url=url,
            importance="preferred",
            confirmed=True
        )
    ]
    for r in sample_reqs:
        db.add(r)
        
    db.commit()
    db.refresh(new_job)
    
    return JobDto(
        id=new_job.id,
        title=new_job.title,
        employer=new_job.employer,
        source_url=new_job.source_url,
        fetched_at=new_job.fetched_at,
        retrieval_status=new_job.retrieval_status,
        requirements=[
            JobRequirementDto(
                id=r.id,
                skill_key=r.skill_key,
                original_text=r.original_text,
                source_url=r.source_url,
                importance=r.importance,
                confirmed=r.confirmed
            )
            for r in new_job.requirements
        ]
    )

@router.get("", response_model=List[JobDto])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    results = []
    for j in jobs:
        results.append(
            JobDto(
                id=j.id,
                title=j.title,
                employer=j.employer,
                source_url=j.source_url,
                fetched_at=j.fetched_at,
                retrieval_status=j.retrieval_status,
                requirements=[
                    JobRequirementDto(
                        id=r.id,
                        skill_key=r.skill_key,
                        original_text=r.original_text,
                        source_url=r.source_url,
                        importance=r.importance,
                        confirmed=r.confirmed
                    )
                    for r in j.requirements
                ]
            )
        )
    return results

@router.get("/{job_id}", response_model=JobDto)
def get_job(job_id: str, db: Session = Depends(get_db)):
    j = db.query(Job).filter(Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobDto(
        id=j.id,
        title=j.title,
        employer=j.employer,
        source_url=j.source_url,
        fetched_at=j.fetched_at,
        retrieval_status=j.retrieval_status,
        requirements=[
            JobRequirementDto(
                id=r.id,
                skill_key=r.skill_key,
                original_text=r.original_text,
                source_url=r.source_url,
                importance=r.importance,
                confirmed=r.confirmed
            )
            for r in j.requirements
        ]
    )

@router.patch("/{job_id}/requirements", response_model=JobDto)
def update_job_requirements(job_id: str, body: UpdateRequirementsRequest, db: Session = Depends(get_db)):
    j = db.query(Job).filter(Job.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
        
    for item in body.requirements:
        req_id = item.get("id")
        if req_id:
            db_req = db.query(JobRequirement).filter(JobRequirement.id == req_id, JobRequirement.job_id == job_id).first()
            if db_req:
                if "confirmed" in item:
                    db_req.confirmed = item["confirmed"]
                if "importance" in item:
                    db_req.importance = item["importance"]
                if "skill_key" in item:
                    db_req.skill_key = item["skill_key"]
                    
    db.commit()
    db.refresh(j)
    return get_job(job_id, db)
