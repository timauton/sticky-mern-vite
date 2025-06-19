// docs: https://vitejs.dev/guide/env-and-mode.html
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;



export async function createMeme(token, title = undefined, image = null){
    const formData = new FormData();
    formData.append('image' , image);
    if (title) {
        formData.append('title' , title);
    }

    const requestOptions = {
        method: 'POST',
        headers: {
        Authorization: `Bearer ${token}`,
    },
    body: formData,
  };

  const response = await fetch(`${BACKEND_URL}/memes`, requestOptions);

  if (response.status !==201) {
    throw new Error ('Unable to fetch memes');
  }

  const data = await response.json();
  return data;

}




// !!! Reference from Acebook services/posts.js:
// export async function createPost(token, message, image = null) {
//   const formData = new FormData();
//   formData.append('message', message);
//   if (image) {
//     formData.append('image', image);
//   }

//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: formData,
//   };

//   const response = await fetch(`${BACKEND_URL}/posts`, requestOptions);

//   if (response.status !== 201) {
//     throw new Error('Unable to fetch posts');
//   }

//   const data = await response.json();
//   return data;
// }