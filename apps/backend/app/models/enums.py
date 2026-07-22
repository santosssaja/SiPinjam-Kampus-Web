from enum import Enum


class UserRole(str, Enum):
    """Roles available in the system."""

    ADMIN = "ADMIN"
    BORROWER = "BORROWER"


class ResourceType(str, Enum):
    """Types of borrowable resources."""

    ITEM = "ITEM"
    ROOM = "ROOM"


class LoanStatus(str, Enum):
    """Lifecycle statuses of a loan request."""

    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
