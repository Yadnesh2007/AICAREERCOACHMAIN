from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ..core.database import get_db
from ..models.db_models import ChangeEvent
from ..models.schemas import ChangeEventDto, ChangedFileDto

router = APIRouter(prefix="/api/events", tags=["GitHub Change Events"])

@router.get("", response_model=dict)
def list_change_events(assessment_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(ChangeEvent)
    if assessment_id:
        query = query.filter(ChangeEvent.assessment_id == assessment_id)
        
    events = query.order_by(ChangeEvent.received_at.desc()).all()
    
    return {
        "events": [
            ChangeEventDto(
                id=ev.id,
                delivery_id=ev.delivery_id,
                repository_id=ev.repository_id,
                ref=ev.ref,
                before_sha=ev.before_sha,
                after_sha=ev.after_sha,
                changed_files=[ChangedFileDto(**cf) for cf in (ev.changed_files or [])],
                affected_skill_keys=ev.affected_skill_keys or [],
                state=ev.state,
                assessment_id=ev.assessment_id,
                from_version=ev.from_version,
                to_version=ev.to_version,
                received_at=ev.received_at,
                processed_at=ev.processed_at,
                message=ev.message
            )
            for ev in events
        ]
    }

@router.get("/{event_id}", response_model=ChangeEventDto)
def get_change_event(event_id: str, db: Session = Depends(get_db)):
    ev = db.query(ChangeEvent).filter(ChangeEvent.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Change event not found")
        
    return ChangeEventDto(
        id=ev.id,
        delivery_id=ev.delivery_id,
        repository_id=ev.repository_id,
        ref=ev.ref,
        before_sha=ev.before_sha,
        after_sha=ev.after_sha,
        changed_files=[ChangedFileDto(**cf) for cf in (ev.changed_files or [])],
        affected_skill_keys=ev.affected_skill_keys or [],
        state=ev.state,
        assessment_id=ev.assessment_id,
        from_version=ev.from_version,
        to_version=ev.to_version,
        received_at=ev.received_at,
        processed_at=ev.processed_at,
        message=ev.message
    )
