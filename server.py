





from flask import Flask, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder="")  # serve files from project root

# ---------- API endpoint ----------
@app.get("/api/products")
def get_products():
    # Load your JSON file from the data folder
    data_file = os.path.join("data", "products.json")
    with open(data_file, "r") as f:
        products = json.load(f)
    return jsonify(products)

# ---------- Serve static files (HTML, CSS, JS) ----------
@app.get("/<path:filename>")
def serve_file(filename):
    return send_from_directory("", filename)

# Serve root page (gallery.html) if just / is requested
@app.get("/")
def root():
    return send_from_directory("", "gallery.html")

# ---------- Run server ----------
if __name__ == "__main__":
    app.run(debug=True)



    