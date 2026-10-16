from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.database import get_db
from ..models.db_models import Repository, GitHubInstallation
from ..models.schemas import RepositoryDto, PatchRepoRequest

router = APIRouter(prefix="/api/github", tags=["GitHub Integration"])

@router.get("/install/start")
def get_install_url():
    return {
        "install_url": "https://github.com/apps/careerproof-coach/installations/new?state=signed_auth_token_8892"
    }

@router.get("/installations")
def get_installations(db: Session = Depends(get_db)):
    insts = db.query(GitHubInstallation).all()
    return {
        "installations": [
            {
                "id": inst.id,
                "account_login": inst.account_login,
                "repository_selection": inst.repository_selection
            }
            for inst in insts
        ]
    }

@router.get("/repos")
def get_repositories(db: Session = Depends(get_db)):
    repos = db.query(Repository).all()
    return {
        "repositories": [
            RepositoryDto(
                id=r.id,
                github_repo_id=r.github_repo_id,
                full_name=r.full_name,
                default_branch=r.default_branch,
                selected_branch=r.selected_branch,
                latest_scanned_sha=r.latest_scanned_sha,
                installation_id=r.installation_id,
                is_selected=r.is_selected
            )
            for r in repos
        ]
    }

@router.patch("/repos/{repo_id}", response_model=RepositoryDto)
def update_repository(repo_id: str, body: PatchRepoRequest, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    if body.is_selected is not None:
        repo.is_selected = body.is_selected
    if body.selected_branch is not None:
        repo.selected_branch = body.selected_branch
        
    db.commit()
    db.refresh(repo)
    return RepositoryDto(
        id=repo.id,
        github_repo_id=repo.github_repo_id,
        full_name=repo.full_name,
        default_branch=repo.default_branch,
        selected_branch=repo.selected_branch,
        latest_scanned_sha=repo.latest_scanned_sha,
        installation_id=repo.installation_id,
        is_selected=repo.is_selected
    )
