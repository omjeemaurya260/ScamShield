#!/usr/bin/env python3
"""
ScamShield – Single Command Execution Manager
Starts and monitors both the FastAPI backend and Vite frontend together.
Author: Team BrainByte
"""

import os
import sys
import time
import socket
import signal
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 8000
FRONTEND_HOST = "127.0.0.1"
FRONTEND_PORT = 5173

backend_process = None
frontend_process = None
shutting_down = False


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a TCP port is currently open and bound."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.6)
        return s.connect_ex((host, port)) == 0


def kill_process_on_port(port: int):
    """Attempt to terminate any process holding a specific port on Windows."""
    if sys.platform != "win32":
        return
    try:
        cmd = f'netstat -ano | findstr :{port}'
        output = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in output.strip().splitlines():
            if "LISTENING" in line:
                parts = line.strip().split()
                pid = parts[-1]
                if pid and pid != "0" and pid != str(os.getpid()):
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
                    time.sleep(0.5)
    except Exception:
        pass


def cleanup():
    """Gracefully terminate both backend and frontend processes."""
    global shutting_down, backend_process, frontend_process
    if shutting_down:
        return
    shutting_down = True

    print("\n[ScamShield] Shutting down services...")

    def kill_proc_tree(proc):
        if not proc:
            return
        try:
            if sys.platform == "win32":
                subprocess.run(
                    f"taskkill /F /T /PID {proc.pid}",
                    shell=True,
                    capture_output=True
                )
            else:
                proc.terminate()
                proc.wait(timeout=3)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass

    if frontend_process:
        kill_proc_tree(frontend_process)
    if backend_process:
        kill_proc_tree(backend_process)

    print("[ScamShield] Services stopped gracefully.")


def signal_handler(sig, frame):
    cleanup()
    sys.exit(0)


def wait_for_backend_health(url: str = "http://127.0.0.1:8000/api/health", timeout: int = 20) -> bool:
    """Poll health endpoint until it returns 200 or timeout."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ScamShield-Runner/1.0"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                if resp.status == 200:
                    return True
        except (urllib.error.URLError, ConnectionResetError, socket.timeout):
            pass
        time.sleep(0.5)
    return False


def main():
    global backend_process, frontend_process

    # Register termination signals
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("[ScamShield] Starting application...\n", flush=True)

    # 1. Port Availability Checks
    if is_port_in_use(BACKEND_PORT, BACKEND_HOST):
        print(f"[ScamShield] Port {BACKEND_PORT} is currently in use. Cleaning up existing process...", flush=True)
        kill_process_on_port(BACKEND_PORT)
        time.sleep(1)
        if is_port_in_use(BACKEND_PORT, BACKEND_HOST):
            print(f"[ScamShield] ERROR: Port {BACKEND_PORT} is occupied by another application. Please free port {BACKEND_PORT} and retry.", flush=True)
            sys.exit(1)

    if is_port_in_use(FRONTEND_PORT, FRONTEND_HOST):
        print(f"[ScamShield] Port {FRONTEND_PORT} is currently in use. Cleaning up existing process...", flush=True)
        kill_process_on_port(FRONTEND_PORT)
        time.sleep(1)
        if is_port_in_use(FRONTEND_PORT, FRONTEND_HOST):
            print(f"[ScamShield] ERROR: Port {FRONTEND_PORT} is occupied. Please free port {FRONTEND_PORT} and retry.", flush=True)
            sys.exit(1)

    # 2. Start FastAPI Backend
    print("[1/2] Starting FastAPI Backend...", flush=True)
    print(f"Backend: http://{BACKEND_HOST}:{BACKEND_PORT}\n", flush=True)

    backend_cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT),
    ]

    try:
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=str(BACKEND_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
    except Exception as e:
        print(f"[ScamShield] Failed to start backend: {e}", flush=True)
        sys.exit(1)

    # 3. Start React + Vite Frontend
    print("[2/2] Starting React Frontend...", flush=True)
    print(f"Frontend: http://{FRONTEND_HOST}:{FRONTEND_PORT}\n", flush=True)

    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_cmd = f"{npm_cmd} run dev -- --host {FRONTEND_HOST} --port {FRONTEND_PORT}"

    try:
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
    except Exception as e:
        print(f"[ScamShield] Failed to start frontend: {e}", flush=True)
        cleanup()
        sys.exit(1)

    # 4. Check Backend Health
    print("[ScamShield] Checking backend health...", flush=True)
    is_healthy = wait_for_backend_health(f"http://{BACKEND_HOST}:{BACKEND_PORT}/api/health", timeout=15)

    if is_healthy:
        print("[ScamShield] Backend is healthy: HTTP 200\n", flush=True)
        print("[ScamShield] Application started successfully!\n", flush=True)
        print(f"Open: http://{FRONTEND_HOST}:{FRONTEND_PORT}\n", flush=True)
        print("(Press Ctrl+C to stop all services)", flush=True)
    else:
        print("[ScamShield] WARNING: Backend health check did not respond in time, checking status...", flush=True)

    # 5. Monitor child processes
    try:
        while True:
            time.sleep(1)

            # Check if backend unexpectedly died
            b_status = backend_process.poll()
            if b_status is not None:
                err = backend_process.stderr.read().decode(errors="ignore") if backend_process.stderr else ""
                print(f"\n[ScamShield] ERROR: Backend process crashed with exit code {b_status}!")
                if err:
                    print(f"Details:\n{err}")
                cleanup()
                sys.exit(1)

            # Check if frontend unexpectedly died
            f_status = frontend_process.poll()
            if f_status is not None:
                err = frontend_process.stderr.read().decode(errors="ignore") if frontend_process.stderr else ""
                print(f"\n[ScamShield] ERROR: Frontend process crashed with exit code {f_status}!")
                if err:
                    print(f"Details:\n{err}")
                cleanup()
                sys.exit(1)

    except KeyboardInterrupt:
        cleanup()
        sys.exit(0)


if __name__ == "__main__":
    main()
