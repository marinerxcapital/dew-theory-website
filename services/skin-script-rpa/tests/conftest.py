"""Pytest fixtures — mock portal server for Playwright E2E."""
from __future__ import annotations

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
MOCK_PORTAL = REPO_ROOT / "services" / "mock-supplier-portal" / "server.py"


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


@pytest.fixture(scope="session")
def mock_portal_url():
    port = _free_port()
    env = {**os.environ, "PORT": str(port)}
    proc = subprocess.Popen(
        [sys.executable, str(MOCK_PORTAL)],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    url = f"http://127.0.0.1:{port}"
    import urllib.error
    import urllib.request

    for _ in range(50):
        try:
            urllib.request.urlopen(f"{url}/login", timeout=1)
            break
        except (OSError, urllib.error.URLError):
            time.sleep(0.1)
    else:
        proc.kill()
        raise RuntimeError("mock portal failed to start")
    yield url
    proc.terminate()
    proc.wait(timeout=5)
