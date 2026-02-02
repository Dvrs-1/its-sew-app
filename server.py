

from flask import Flask, jsonify, send_from_directory, render_template
import json
import os

app = Flask(__name__)  # <-- IMPORTANT: no static_folder override

@app.get("/api/products")
def get_products():
    with open(os.path.join("data", "products.json")) as f:
        return jsonify(json.load(f))

@app.get("/gallery")
def gallery():
    return render_template("gallery.html")

@app.get("/aboutus")
def about():
    return render_template("aboutus.html")

@app.get("/foru")
def for_you():
    return render_template("foru.html") 

@app.get("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
    