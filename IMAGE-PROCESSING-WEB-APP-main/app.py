from flask import Flask, render_template, request, jsonify, redirect, session, url_for
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash


import cv2
import numpy as np
import base64
from flask import Flask, render_template, request, jsonify
from io import BytesIO
from PIL import Image

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)
app.secret_key = "your_secret_key"

# MySQL Configuration
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "root"  # Add your MySQL password if needed
app.config["MYSQL_DB"] = "user_db"

mysql = MySQL(app)

# Route for login page
@app.route("/")
def login_page():
    return render_template("login.html")

# Route for registration page
@app.route("/register_page")
def register_page():
    return render_template("register.html")

# Route for main index page (protected)
@app.route("/index")
def index():
    if "user" in session:
        return render_template("index.html")  # Only allow access if logged in
    return redirect(url_for("login_page"))

# Route for user registration
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data["email"]
    password = generate_password_hash(data["password"])  # Hash password for security

    cur = mysql.connection.cursor()
    try:
        cur.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (email, password))
        mysql.connection.commit()
        return jsonify({"status": "success", "message": "User registered successfully!"})
    except:
        return jsonify({"status": "error", "message": "Email already exists!"})
    finally:
        cur.close()

# Route for user login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    cur = mysql.connection.cursor()
    cur.execute("SELECT password FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()

    if user and check_password_hash(user[0], password):
        session["user"] = email  # Store session
        return jsonify({"status": "success", "redirect": url_for("index")})
    else:
        return jsonify({"status": "error", "message": "Invalid email or password!"})

# Route for logout
@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login_page"))

# advanced
@app.route("/advanced")
def advanced_page():
    if "user" in session:
        return render_template("advanced.html")  # Only allow access if logged in
    return redirect(url_for("login_page"))

@app.route("/process_image", methods=["POST"])
def process_image():
    data = request.json
    effects = data["effects"]  # Accept multiple effects
    image_data = data["image"].split(",")[1]

    # Convert base64 image to OpenCV format
    image = Image.open(BytesIO(base64.b64decode(image_data)))
    image = np.array(image)

    # Apply multiple effects
    if "cartoon" in effects:
        image = apply_cartoon_effect(image)
    if "pencil" in effects:
        image = apply_pencil_sketch(image)
    if "oil" in effects:
        image = apply_oil_painting(image)
    if "edge" in effects:
        image = apply_edge_detection(image)

    # Encode the processed image back to base64
    _, buffer = cv2.imencode(".png", image)
    encoded_image = base64.b64encode(buffer).decode("utf-8")

    return jsonify({"processed_image": "data:image/png;base64," + encoded_image})

# ------------- IMAGE PROCESSING FUNCTIONS ----------------
def apply_cartoon_effect(image):
    """ Apply cartoon effect to the image """
    if image.shape[2] == 4:  # Convert RGBA to RGB
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.medianBlur(gray, 5)
    edges = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
                                  cv2.THRESH_BINARY, 9, 9)
    color = cv2.bilateralFilter(image, 9, 300, 300)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    return cartoon

def apply_pencil_sketch(image):
    """ Apply pencil sketch effect to the image """
    if image.shape[2] == 4:  # Convert RGBA to RGB
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    inv_gray = 255 - gray
    blur = cv2.GaussianBlur(inv_gray, (21, 21), 0)
    sketch = cv2.divide(gray, 255 - blur, scale=256)
    return cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)

def apply_oil_painting(image):
    """ Apply oil painting effect to the image """
    if image.shape[2] == 4:  # Convert RGBA to BGR
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)

    return cv2.xphoto.oilPainting(image, 7, 1)

def apply_edge_detection(image):
    """ Apply edge detection effect to the image """
    if image.shape[2] == 4:  # Convert RGBA to RGB
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

if __name__ == "__main__":
    app.run(debug=True)
