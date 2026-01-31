import modal
import base64
import os
import io
import sys
import shutil
import threading
import queue
import time
import traceback
import json

image = modal.Image.debian_slim().pip_install(
    "torch",
    "matplotlib",
    "fastapi[standard]"
)

app = modal.App("blockly-ml-backend")

class QueueWriter:
    def __init__(self, q):
        self.q = q

    def write(self, text):
        if text:
            self.q.put({"type": "log", "data": text})

    def flush(self):
        pass

@app.function(
    image=image,
    cpu=4.0,
    memory=4096,
    timeout=3600,
    env={"PYTHONUNBUFFERED": "1"}
)
@modal.fastapi_endpoint(method="POST", docs=True)
def execute_python(data: dict):

    code = data.get("code", "")
    files = data.get("files", {})

    q = queue.Queue()

    q.put({"type": "log", "data": "✅ Backend received request\n"})
    q.put({"type": "log", "data": f"📝 Code: {len(code)} chars\n"})
    q.put({"type": "log", "data": f"📁 Files: {len(files)}\n"})

    def worker():
        SAVE_DIR = os.path.abspath("saved_files")
        os.makedirs(SAVE_DIR, exist_ok=True)

        original_stdout = sys.stdout
        original_stderr = sys.stderr

        try:
            if files:
                q.put({"type": "log", "data": f"📦 Processing {len(files)} file(s)...\n"})
                for filename, b64_content in files.items():
                    file_bytes = base64.b64decode(b64_content)
                    full_path = os.path.join(SAVE_DIR, filename)

                    if "/" in filename:
                        os.makedirs(os.path.dirname(full_path), exist_ok=True)

                    with open(full_path, "wb") as f:
                        f.write(file_bytes)
                    q.put({"type": "log", "data": f"  ✓ Saved {filename}\n"})

            sys.stdout = QueueWriter(q)
            sys.stderr = QueueWriter(q)

            q.put({"type": "log", "data": "\n🚀 Starting execution...\n\n"})

            original_dir = os.getcwd()
            os.chdir(SAVE_DIR)

            try:
                exec(code, {'__name__': '__main__'})

                import matplotlib.pyplot as plt
                if plt.get_fignums():
                    q.put({"type": "log", "data": "\n📊 Generating plot...\n"})
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
                    buf.seek(0)
                    img_str = base64.b64encode(buf.read()).decode('utf-8')
                    q.put({"type": "image", "data": img_str})
                    plt.close('all')
                    q.put({"type": "log", "data": "✅ Plot generated\n"})

            except Exception as e:
                error_trace = traceback.format_exc()
                q.put({"type": "log", "data": f"\n❌ Runtime Error:\n{error_trace}\n"})
            finally:
                os.chdir(original_dir)

        except Exception as system_error:
            error_trace = traceback.format_exc()
            q.put({"type": "log", "data": f"\n❌ System Error:\n{error_trace}\n"})

        finally:
            sys.stdout = original_stdout
            sys.stderr = original_stderr

            if os.path.exists(SAVE_DIR):
                shutil.rmtree(SAVE_DIR)

            q.put(None)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    def event_stream():
        message_count = 0
        last_ping = time.time()

        while True:
            try:
                item = q.get(timeout=0.1)

                if item is None:
                    yield f"data: {json.dumps({'type': 'complete', 'messages': message_count})}\n\n"
                    break

                message_count += 1
                yield f"data: {json.dumps(item)}\n\n"
                last_ping = time.time()

            except queue.Empty:
                if not thread.is_alive() and q.empty():
                    yield f"data: {json.dumps({'type': 'complete', 'messages': message_count})}\n\n"
                    break

                if time.time() - last_ping > 2.0:
                    yield f"data: {json.dumps({'type': 'ping', 'messages': message_count})}\n\n"
                    last_ping = time.time()

    from modal import web_endpoint
    from starlette.responses import StreamingResponse

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )