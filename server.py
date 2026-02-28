print("THIS is server.py")
from flask import Flask, request, jsonify, send_from_directory, render_template
import json 
import os

app = Flask(__name__)  # <-- IMPORTANT: no static_folder override


import psycopg2
from psycopg2.extras import RealDictCursor

import psycopg2
from psycopg2.extras import RealDictCursor
import os

def get_db_connection():
    database_url = os.environ.get("DATABASE_URL")

    if database_url:
        # Production (Render)
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    else:
        # Local development fallback
        return psycopg2.connect(
            dbname="itssewregina_dev",
            user="itssewregina_user",
            password="burnTToast0!",
            host="localhost",
            port="5432",
            cursor_factory=RealDictCursor
        )

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


@app.get("/api/categories")
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT slug AS "id",
               label,
               NULL::text AS description,
               NULL::text AS image
        FROM categories
        ORDER BY label;
    """)

    categories = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(categories)

@app.get("/api/products")
def get_products():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Get products
    cur.execute("""
        SELECT p.id, p.name, p.description, c.slug AS categoryId
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
    """)
    products = cur.fetchall()

    print("DEBUG products:", products)

    result = []

    for product in products:
        product_id = product["id"]

        # Variants
        cur.execute("""
            SELECT id, sku, size, price, inventory
            FROM product_variants
            WHERE product_id = %s
        """, (product_id,))
        variants = cur.fetchall()

        for v in variants:
            v["price"] = float(v["price"])

        # Images
        cur.execute("""
            SELECT variant_id AS "variantId",
                   url,
                   alt,
                   description,
                   role,
                   display_order AS "order"
            FROM product_images
            WHERE variant_id IN (
                SELECT id FROM product_variants WHERE product_id = %s
            )
            ORDER BY variant_id, display_order
        """, (product_id,))
        images = cur.fetchall()

        result.append({
            "id": product["id"],
            "name": product["name"],
            "categoryId": product["categoryid"],
            "description": product["description"],
            "variants": variants,
            "images": images
        })


    cur.close()
    conn.close()
    return jsonify(result)

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