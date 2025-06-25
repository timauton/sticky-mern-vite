export const generateShareableUrl = (meme) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/meme/${meme._id}`
}