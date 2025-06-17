

export const StatsPage = () => {
  return (
    <div className="stats-page-wrapper">
      <div className="stats-title">
        <h1>Stats page</h1>
      </div>
      <div className="card my-memes-card">
        <div className="my-memes">
          <h2>My Memes</h2>
          <div className="my-meme">
            <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 1" />
            <h3>This is one of my memes</h3>
          </div>
          <div className="my-meme">
            <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 1" />
            <h3>This is one of my memes</h3>
          </div>
          <div className="my-meme">
            <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 1" />
            <h3>This is one of my memes</h3>
          </div>
          <div className="my-meme">
            <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 1" />
            <h3>This is one of my memes</h3>
          </div>
        </div>
      </div>
      <div className="card my-profile-card">
        <h2>My Profile</h2>
        <h3>A piece of profile information</h3>
        <h3>A piece of profile information</h3>
        <h3>A piece of profile information</h3>
      </div>
      <div className="card stats-card">
        <h2>My Charts</h2>
        <h3>Stats chart 1</h3>
        <h3>Stats chart 2</h3>
        <h3>Stats chart 3</h3>
      </div>
    </div>
  );
};
