# Django Version Review

## Issue Found

Pinned project requirements specify `Django==4.2.10`, while the local backend venv currently runs Python 3.14.4 and Django 6.0.4.

## Root Cause

The local venv drifted from the checked-in production requirements. Installing the full development requirements on Python 3.14 failed at `Pillow==10.2.0`, which is consistent with the pinned stack targeting an older Python runtime.

## Compatibility Finding

The Docker backend image uses `python:3.11-slim`, and the requirements are pinned around Django 4.2 LTS-era packages. This is the safer production target.

## Decision

Do not upgrade requirements to Django 6 in this repair pass. The safer production approach is:

- Keep Django 4.2 requirements for now.
- Recreate local and CI environments with Python 3.11.
- Install `backend/requirements/development.txt` in that Python 3.11 environment.
- Plan a separate Django 5/6 migration with dependency compatibility checks.

## Verification Performed

- `venv\Scripts\python.exe manage.py check`: passed under the current local venv.
- `venv\Scripts\python.exe -m pytest`: passed using dedicated test settings.

## Remaining Risk

The current local venv still does not match production pins. Rebuild it on Python 3.11 before treating local dependency behavior as production-equivalent.
