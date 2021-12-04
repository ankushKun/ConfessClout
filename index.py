from flask import Flask, render_template, request, jsonify, url_for
from deso import Post
from werkzeug.utils import redirect
from decouple import config
import os
import json
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


DATA = {}


@app.route("/", methods=["POST", "GET"])
def home():
    global DATA
    print(DATA)
    if request.method == "POST":
        print(request.form)
        if "publicKey" in request.form:
            DATA["publicKey"] = request.form["publicKey"]
            print("/ - publicKey", DATA)
            return render_template("index.html", data=DATA), 200
        if "confession" in request.form:
            postBody = request.form["confession"].replace(
                "@", "@ ").replace("@  ", "@ ")
            try:
                pubKey = DATA["publicKey"]
                if(not (pubKey == None or pubKey == "")):
                    current_count = get_current_count()
                    res = post.send(
                        f"Confession #{current_count} \n\n{postBody}")
                    if res["status"] == 200:
                        hex = res["postHashHex"]
                        DATA = {
                            "postUrl": f"https://bitclout.com/posts/{hex}", "count": current_count
                        }
                        increment_counter()
                        return render_template("done.html", data=DATA), 200
                else:
                    return render_template("error.html", data={"error": "'publicKey' not found"}), 400
            except Exception as e:
                return render_template("error.html", data={"error": e}), 400

    else:
        return render_template("index.html", data=DATA)


if __name__ == "__main__":
    app.run(debug=False)
