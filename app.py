from flask import Flask
from flask import send_from_directory

app = Flask(__name__)


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)


@app.errorhandler(404)
def page_not_found(e):
    return send_from_directory("static", "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
