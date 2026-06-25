from datetime import date, time
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import CurrentAdmin, CurrentUser, get_borrowing_service
from app.models.enums import ResourceType, UserRole
from app.schemas.loan import (
    AvailabilityResponse,
    LoanCreate,
    LoanResponse,
)
from app.services.borrowing_service import BorrowingService

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get("/availability", response_model=AvailabilityResponse)
def check_availability(
    resource_type: ResourceType,
    resource_id: int,
    loan_date: date = Query(..., alias="date"),
    start_time: time = Query(...),
    end_time: time = Query(...),
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_user: CurrentUser = None,
):
    """
    Check whether a resource is available for the requested time window.
    Returns availability status and conflict count.
    """
    return borrowing_service.check_availability(
        resource_type=resource_type,
        resource_id=resource_id,
        loan_date=loan_date,
        start_time=start_time,
        end_time=end_time,
    )


@router.get("", response_model=list[LoanResponse])
def list_loans(
    skip: int = 0,
    limit: int = 100,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_user: CurrentUser = None,
):
    """
    List loans.
    - ADMIN sees all loans.
    - BORROWER sees only their own loans.
    """
    if current_user.role == UserRole.ADMIN:
        return borrowing_service.get_all_loans(skip=skip, limit=limit)
    return borrowing_service.get_loans_by_borrower(
        borrower_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(
    loan_id: int,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_user: CurrentUser = None,
):
    """
    Get a single loan.
    - ADMIN can access any loan.
    - BORROWER can only access their own loans.
    """
    from fastapi import HTTPException, status

    loan = borrowing_service.get_loan_by_id(loan_id)
    if current_user.role != UserRole.ADMIN and loan.borrower_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this loan",
        )
    return loan


@router.post("", response_model=LoanResponse, status_code=201)
def create_loan(
    data: LoanCreate,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_user: CurrentUser = None,
):
    """Submit a new loan/reservation request."""
    return borrowing_service.create_loan(data, borrower=current_user)


@router.post("/{loan_id}/approve", response_model=LoanResponse)
def approve_loan(
    loan_id: int,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Approve a pending loan. Admin only."""
    return borrowing_service.approve_loan(loan_id, admin=current_admin)


@router.post("/{loan_id}/reject", response_model=LoanResponse)
def reject_loan(
    loan_id: int,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Reject a pending loan. Admin only."""
    return borrowing_service.reject_loan(loan_id, admin=current_admin)


@router.post("/{loan_id}/complete", response_model=LoanResponse)
def complete_loan(
    loan_id: int,
    borrowing_service: Annotated[BorrowingService, Depends(get_borrowing_service)] = None,
    current_admin: CurrentAdmin = None,
):
    """Mark an approved loan as completed. Admin only."""
    return borrowing_service.complete_loan(loan_id, admin=current_admin)
