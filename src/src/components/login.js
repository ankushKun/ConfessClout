
const identityEndpoint = "https://identity.deso.org";
var pubKey;
var set;

function setPublicKeySetter(f) {
    set = f;
}

function login() {
    identityWindow = window.open(
        `${identityEndpoint}/log-in?accessLevelRequest=2`,
        null,
        "toolbar=no, width=800, height=1000, top=0, left=0"
    );
}

function handleInit(e) {
    if (!init) {
        init = true;
        iframe = document.getElementById("identity");

        for (const e of pendingRequests) {
            postMessage(e);
        }

        pendingRequests = [];
    }
    respond(e.source, e.data.id, {});
}

function handleLogin(payload) {
    // console.log(payload);
    if (identityWindow) {
        identityWindow.close();
        identityWindow = null;
        pubKey = payload.publicKeyAdded;
        set(pubKey);
    }


}

function respond(e, t, n) {
    e.postMessage(
        {
            id: t,
            service: "identity",
            payload: n,
        },
        "*"
    );
}

function postMessage(e) {
    init
        ? this.iframe.contentWindow.postMessage(e, "*")
        : pendingRequests.push(e);
}

// const childWindow = document.getElementById('identity').contentWindow;
window.addEventListener("message", (message) => {
    // console.log("message: ");
    // console.log(message);

    const {
        // eslint-disable-next-line
        data: { id, method, payload },
    } = message;

    // console.log(id);
    // console.log(method);
    // console.log(payload);

    if (method === "initialize") {
        handleInit(message);
    } else if (method === "login") {
        handleLogin(payload);
    }
});

// eslint-disable-next-line
var init = false;
// eslint-disable-next-line
var iframe = null;
// eslint-disable-next-line
var pendingRequests = [];
// eslint-disable-next-line
var identityWindow = null;

module.exports = { setPublicKeySetter, login }