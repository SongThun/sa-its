"""
Base service classes and result types.
Provides a consistent pattern for service layer responses.
"""

from dataclasses import dataclass, field
from typing import TypeVar, Generic, Optional, Dict, Any, List

T = TypeVar("T")


@dataclass
class ServiceError:
    """Represents a service-level error."""

    code: str
    message: str
    field: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for API responses."""
        if self.field:
            return {self.field: [self.message]}
        return {"detail": self.message}


@dataclass
class ServiceResult(Generic[T]):
    """
    Result wrapper for service operations.
    Follows the Result pattern - either success with data or failure with errors.
    """

    success: bool
    data: Optional[T] = None
    errors: List[ServiceError] = field(default_factory=list)

    @classmethod
    def ok(cls, data: T) -> "ServiceResult[T]":
        """Create a successful result."""
        return cls(success=True, data=data)

    @classmethod
    def fail(
        cls, code: str, message: str, field: Optional[str] = None
    ) -> "ServiceResult[T]":
        """Create a failed result with a single error."""
        return cls(success=False, errors=[ServiceError(code, message, field)])

    @classmethod
    def fail_multiple(cls, errors: List[ServiceError]) -> "ServiceResult[T]":
        """Create a failed result with multiple errors."""
        return cls(success=False, errors=errors)

    def error_dict(self) -> Dict[str, Any]:
        """Convert all errors to a dictionary for API responses."""
        result: Dict[str, Any] = {}
        for error in self.errors:
            error_data = error.to_dict()
            for key, value in error_data.items():
                if key in result:
                    if isinstance(result[key], list):
                        result[key].extend(
                            value if isinstance(value, list) else [value]
                        )
                    else:
                        result[key] = [result[key]] + (
                            value if isinstance(value, list) else [value]
                        )
                else:
                    result[key] = value
        return result
