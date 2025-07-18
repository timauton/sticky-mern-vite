// docs: https://vitejs.dev/guide/env-and-mode.html
// URL needs to be replaced
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function login(username, password) {
  const payload = {
    username: username,
    password: password,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(`${BACKEND_URL}/tokens`, requestOptions);

  // docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
  if (response.status === 201) {
    let data = await response.json();
    return data.token;
  } else {
    throw new Error(
      `Received status ${response.status} when logging in. Expected 201`
    );
  }
}

export async function signup(username, password, email) {
  const payload = {
    username: username,
    password: password,
    email: email
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  console.log('calling API with:', {username, password, email});
  console.log('Backend URL:', BACKEND_URL);  // Add this before fetch

  let response = await fetch(`${BACKEND_URL}/users/registerUser`, requestOptions);

  // docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
  if (response.status === 201) {
    return;
  } else {
    throw new Error(
      `Received status ${response.status} when signing up. Expected 201`
    );
  }
}
