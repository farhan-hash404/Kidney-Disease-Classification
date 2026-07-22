import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 65)
    print("  Kidney Disease Classification AI System - Unified Launcher")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    print("\n[1/3] Starting FastAPI Backend on http://localhost:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    backend_process = subprocess.Popen(backend_cmd, cwd=base_dir)

    print("[2/3] Waiting for Backend initialization...")
    time.sleep(3)

    print("[3/3] Starting React Frontend Dev Server on http://localhost:3000...")
    frontend_cmd = ["npm", "run", "dev"]
    frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

    print("\n" + "=" * 65)
    print("  System is fully running!")
    print("  - Backend API: http://localhost:8000/docs")
    print("  - Frontend UI: http://localhost:3000")
    print("  Press Ctrl+C to terminate both servers.")
    print("=" * 65 + "\n")

    try:
        webbrowser.open("http://localhost:3000")
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down KidneyVision AI servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
