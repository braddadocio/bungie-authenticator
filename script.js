// Creates a random 20 character string for the 'secret' we will use
// for the OAuth authentication flow.
let clientState = sessionStorage.getItem('clientState');
if (!clientState) {
  clientState = Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join('');
  sessionStorage.setItem('clientState', clientState);
}

function startAuthorization(e) {
  e.preventDefault();
  // first, save the client id, secret to session storage since
  // we will need them to complete the authorization flow.
  const form = document.querySelector('form');
  const clientId = form.elements['clientId'].value;
  const clientSecret = form.elements['clientSecret'].value;
  sessionStorage.setItem('clientId', clientId);
  sessionStorage.setItem('clientSecret', clientSecret);
  location.href = `https://www.bungie.net/en/OAuth/Authorize?client_id=${clientId}&response_type=code&state=${clientState}`;
}

window.addEventListener('load', () => {
  const clientId = sessionStorage.getItem('clientId');
  const clientSecret = sessionStorage.getItem('clientSecret');
  if (document.location.search) {
    const params = new URLSearchParams(document.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (state !== clientState) {
      alert("Invalid parameter. Please reload this page and try again.");
      location.href = '/';
    } else {
      document.querySelector(
        "#container"
      ).innerHTML = `<p>Here are the settings for the .env file:</p>
            <fieldset>
            <textarea id="token"></textarea>
            </fieldset>
            <p><a href="/">Start over</a></p>`;
      fetch("https://www.bungie.net/platform/app/oauth/token/", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}`
      })
        .then((resp) => resp.json())
        .then((token) => {
          console.log('received token', token);
          document.querySelector("#token").value = `OAUTH_CLIENT_ID="${clientId}"
OAUTH_CLIENT_SECRET="${clientSecret}"
OAUTH_ACCESS_TOKEN="${token.access_token}"
OAUTH_REFRESH_TOKEN="${token.refresh_token}"`;
        });
    }
  } else {
    const form = document.querySelector('form');
    if (clientId) {
      form.elements['clientId'].value = clientId;
    }
    if (clientSecret) {
      form.elements['clientSecret'].value = clientSecret;
    }
  }
});
