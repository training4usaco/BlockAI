import modal
from fastapi import Request
from pydantic import BaseModel
import base64
import os
import io
import contextlib
import shutil

image = modal.Image.debian_slim().pip_install("torch", "matplotlib")
app = modal.App("blockly-ml-backend")

class ExecutionRequest(BaseModel):
    code: str
    files: dict[str, str]

@app.function(image=image, cpu=2.0, memory=1024, timeout=60)
@modal.web_endpoint(method="POST")
async def execute_python(data: ExecutionRequest):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(script_dir)

    SAVE_DIR = os.path.join(backend_root, "saved_files")
    os.makedirs(SAVE_DIR, exist_ok=True)

    created_files = []

    try:
        for filename, b64_content in data.files.items():
            file_bytes = base64.b64decode(b64_content)

            full_path = os.path.join(SAVE_DIR, filename)

            if "/" in filename:
                os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, "wb") as f:
                f.write(file_bytes)
            created_files.append(full_path)

        output_buffer = io.StringIO()
        image_b64 = None

        with contextlib.redirect_stdout(output_buffer), contextlib.redirect_stderr(output_buffer):
            try:
                original_dir = os.getcwd()
                os.chdir(SAVE_DIR)

                try:
                    exec(data.code, {'__name__': '__main__'})

                    import matplotlib.pyplot as plt
                    if plt.get_fignums():
                        buf = io.BytesIO()
                        plt.savefig(buf, format='png')
                        buf.seek(0)
                        image_b64 = base64.b64encode(buf.read()).decode('utf-8')
                        plt.close()
                finally:
                    os.chdir(original_dir)

            except Exception as e:
                print(f"Runtime Error: {e}")

    finally:
        if os.path.exists(SAVE_DIR):
            shutil.rmtree(SAVE_DIR)

    return {
        "logs": output_buffer.getvalue(),
        "image": image_b64
    }