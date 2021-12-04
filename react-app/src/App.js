import { useState } from 'react';
import './App.css';

import Footer from './components/footer';
import Header from './components/header';
import { setPublicKeySetter, login } from './components/login';

function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [confession, setConfession] = useState(null);
  setPublicKeySetter(setPublicKey);

  const handleSubmit = (event) => {
    event.preventDefault();
  }

  return (
    <div className="App">
      <header className="App-header">
        <Header />
        {publicKey ?
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
      </header>
    </div >
  );
}

export default App;
