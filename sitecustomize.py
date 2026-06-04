"""
Python 3.10 compatibility shim for GenLayer dependencies that expect
collections.abc.Buffer (added in 3.12).
"""
from __future__ import annotations

import collections.abc as _abc
from typing import Any

if not hasattr(_abc, "Buffer"):
    _abc.Buffer = Any  # type: ignore[attr-defined]
