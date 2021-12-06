import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import './App.css';

import Footer from './components/footer';
import Header from './components/header';
import { setPublicKeySetter, login } from './components/login';

function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [confession, setConfession] = useState(null);
  const [postUrl, setPostUrl] = useState(null);
  const [count, setCount] = useState(null);
  setPublicKeySetter(setPublicKey);
  useEffect(() => {
    if (publicKey) {
      axios.post("/setPublicKey", { publicKey: publicKey }).then(console.log("publicKey sent to backend"));
    }
  }, [publicKey]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (confession) {
      const res = await axios.post("/postConfession", { confession: confession, publicKey: publicKey })
        .then((res) => {
          if (res.status === 200) { return res.data }
        });
      setCount(res.count);
      setPostUrl(res.postUrl);


    }
  }

  return (<BrowserRouter basename="/">
    <div className="App">
      <header className="App-header">
        <Header />
        {postUrl == null && count == null ? <>

          {
            publicKey ?
              <p style={{ fontSize: "small" }}>You are {publicKey}</p> :
              <><button className="button" onClick={login}>Login with DESO to post confessions</button><br /></>
          }

          <form className="confessionForm" onSubmit={handleSubmit}>
            <textarea id="confession" name="confession" cols="100" rows="20" style={{ maxWidth: "80vw", maxHeight: "50vh" }}
              minLength="10" required placeholder="Write confession here ;)" onChange={(e) => { setConfession(e.target.value) }}
              disabled={publicKey ? false : true}></textarea >
            <br />
            <input type="submit" value="SEND" className="button" disabled={publicKey ? false : true} style={publicKey ? {} : { backgroundColor: 'grey', color: 'black' }} />
          </form >
          <Footer />
        </> : <>
          <h2>Your confession was sent :)</h2>
          <h4>Confession #{count}</h4>
          <a href={postUrl} target="_blank" rel="noreferrer"><button className="button">view confession</button></a>
          <br />
          <button className="button" onClick={() => { window.location.reload() }}>go back</button>
        </>
        }
      </header>
    </div ></BrowserRouter>
  );
}

export default App;
