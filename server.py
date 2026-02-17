print("THIS is server.py")
from flask import Flask, request, jsonify, send_from_directory, render_template
import json 
import os

app = Flask(__name__)  # <-- IMPORTANT: no static_folder override




@app.route("/")
def home():
    return render_template("index.html")

@app.get("/gallery")
def gallery():
    return render_template("gallery.html")

@app.get("/aboutus")
def about():
    return render_template("aboutus.html")

@app.get("/forum")
def forum():
    return render_template("foru.html") 



@app.get("/api/products")
def get_products():
    with open(os.path.join("data", "products.json")) as f:
        return jsonify(json.load(f))
    
@app.get("/api/categories")
def get_categories():
    with open(os.path.join("data/categories.json")) as f:
        return jsonify(json.load(f))



import html


@app.route("/api/process", methods=["POST"])

def process_form():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    # Sanitize (equivalent to htmlspecialchars)
    name = html.escape(data.get("name", ""))
    email = html.escape(data.get("email", ""))
    phone = html.escape(data.get("phone", ""))
    feedback = html.escape(data.get("feedback", ""))
    custom_order = bool(data.get("customOrder", False))

    response = {
        "status": "success",
        "data": {
            "name": name,
            "email": email,
            "phone": phone,
            "feedback": feedback,
            "customOrder": custom_order
        }
    }

    return jsonify(response), 200




print(app.url_map)

if __name__ == "__main__":
 app.run(debug=True)