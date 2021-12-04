from flask import Flask, render_template, request, session, redirect
from deso import Post
from decouple import config
import json
from flask.helpers import url_for
import pyrebase


SEEDHEX = config("SEEDHEX")
PUBKEY = config("PUBKEY")
FIREBASE_CONFIG = json.loads(config("FIREBASE_CONFIG"))

app = Flask(__name__)
post = Post(SEEDHEX, PUBKEY)

firebase = pyrebase.initialize_app(FIREBASE_CONFIG)
db = firebase.database()


def get_current_count():
    return int(db.child("ConfessClout").child("counter").get().val())+1


def increment_counter():
    counter = get_current_count()
    db.child("ConfessClout").child("counter").set(counter)


@app.route("/", methods=["POST", "GET"])
def home():
    return render_template("index.html", data=session)


@app.route("/setPublicKey", methods=["POST"])
def setPublicKey():
    pk = request.form["publicKey"]
    session["publicKey"] = pk
    return "public key stored in session", 200


@app.route("/postConfession", methods=["POST"])
def postConfession():
    if "publicKey" in session:
        if "confession" in request.form:
            session["postBody"] = request.form["confession"]
        else:
            return render_template("error.html", data={"error": "did not get postBody"}), 200
        try:
            b = session['postBody']
            res = post.send(
                f"Confession #{get_current_count()}\n⸻⸻⸻⸻⸻\n{b}")

            if res["status"] == 200:
                data = {"postUrl": "https://bitclout.com/posts/" + res["postHashHex"],
                        "count": get_current_count()
                        }
                increment_counter()
                del session["publicKey"]
                del session["postBody"]
                return render_template("done.html", data=data), 200
            else:
                return render_template("error.html", data={"error": res}), 200
        except Exception as e:
            return render_template("error.html", data={"error": e}), 200
    else:
        return render_template("error.html", data={"error": "'publicKey' not found"}), 200


if __name__ == "__main__":
    app.secret_key = config("SESSION_KEY")
    app.run(debug=True)
