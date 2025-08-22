from flask import Flask, request, jsonify
from flask_cors import CORS
import replicate
import os
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)  # enable CORS untuk semua origin

CUSTOM_PROMPT_SUFFIX = os.getenv("CUSTOM_PROMPT_SUFFIX", "")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

if not REPLICATE_API_TOKEN:
    raise ValueError("Replicate API token not set in environment!")

def extract_text(event):
    if isinstance(event, str):
        return event
    elif isinstance(event, dict):
        text = ""
        for v in event.values():
            text += extract_text(v)
        return text
    elif isinstance(event, list):
        return "".join(extract_text(e) for e in event)
    return ""


@app.route("/api/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        print("\n=== New Request ===")
        print("Headers:", dict(request.headers))
        print("JSON:", data)

        if not data or "prompt" not in data:
            return jsonify({"error": "No 'prompt' in request"}), 400

        user_prompt = data.get("prompt", "")
        final_prompt = user_prompt + "\n" + CUSTOM_PROMPT_SUFFIX
        print("Final prompt:", final_prompt)

        # streaming output dari Replicate
        output_text = ""
        for event in replicate.stream(
            "ibm-granite/granite-3.3-8b-instruct",
            input={"prompt": final_prompt}
        ):
            print("Event received:", event)
            # Ambil data dari ServerSentEvent
            if hasattr(event, "data") and event.data.strip():
                output_text += event.data + " "

        output_text = output_text.strip()
        if output_text.endswith("{}"):
            output_text = output_text[:-2].strip()

        print("Final output:", output_text)

        return jsonify({"result": output_text})
    

    except Exception as e:
        print("Exception occurred:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
