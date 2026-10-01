"""
Code execution service for CodeBuddy.
All web languages (HTML, CSS, JavaScript) execute directly in the browser's
sandboxed iframe preview, requiring no server-side compilers or external APIs.
"""
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path


class PythonIsolatedRunner:
    """
    Subprocess runner for Python (used exclusively by backend challenge auto-grader).
    """
    def run(self, code: str, stdin: str = "", timeout: float = 5.0) -> dict:
        temp_dir = tempfile.mkdtemp(prefix="codebuddy_py_")
        script_file = Path(temp_dir) / "solution.py"
        try:
            script_file.write_text(code, encoding="utf-8")
            proc = subprocess.run(
                [sys.executable, str(script_file)],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
            return {
                "status": "success" if proc.returncode == 0 else "error",
                "stdout": proc.stdout or "",
                "stderr": proc.stderr or "",
                "exit_code": proc.returncode,
                "execution_time": 0.05,
            }
        except subprocess.TimeoutExpired:
            return {
                "status": "timeout",
                "stdout": "",
                "stderr": f"Time limit exceeded! Took longer than {timeout}s.",
                "exit_code": -1,
                "execution_time": timeout,
            }
        except Exception as e:
            return {
                "status": "error",
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1,
                "execution_time": 0,
            }
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)


class ExecutionService:
    @classmethod
    def execute(cls, language: str, code: str = "", stdin: str = "") -> dict:
        lang = language.lower().strip()

        if lang in ["html", "css", "javascript", "js"]:
            # All web languages execute client-side in the sandboxed browser preview
            return {
                "status": "client_side",
                "stdout": f"{lang.upper()} preview rendered client-side.",
                "stderr": "",
                "exit_code": 0,
                "execution_time": 0.05,
            }
        else:
            return {
                "status": "error",
                "stdout": "",
                "stderr": f"Language '{language}' is not supported. CodeBuddy supports: HTML, CSS, JavaScript.",
                "exit_code": 1,
                "execution_time": 0,
            }
