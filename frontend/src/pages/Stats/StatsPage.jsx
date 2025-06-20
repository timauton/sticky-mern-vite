
import MemeUploadButton from "../../components/MemeUploadButtonComponent";
import MemeUpload from "../../components/MemeUploadComponent";

export const StatsPage = () => {
  return (
    <div className="stats-page-wrapper">

      <div className="stats-title">
        <h1>Stats page</h1>
      </div>

      <div className="row">

      <div className="column">
        <div className="card my-profile-card">
          <h2>My Profile</h2>
          <img className="avatar" src="/temp-images/avatar.jpg" alt="User avatar" />
          <h3>username</h3>
          <h3>password</h3>
        </div>

        <div className="card stats-card">
          <h2>My Charts</h2>
          <img src="/temp-images/chart1.png" alt="Chart 1"/>
          <img src="/temp-images/chart2.png" alt="Chart 2"/>
          <img src="/temp-images/chart3.png" alt="Chart 3"/>
        </div>
      </div>

      <div className="column">
        <div className="card my-memes-card">
          <div className="my-memes">
            <h2>My Memes</h2>
            <div className="my-meme">
              <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 1" />
              <h3>This is one of my memes</h3>
            </div>
            <div className="my-meme">
              <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 2" />
              <h3>This is one of my memes</h3>
            </div>
            <div className="my-meme">
              <img src="/temp-images/temp-meme-image.jpeg" alt="Meme 3" />
              <h3>This is one of my memes</h3>
            </div>
          </div>  
        </div>
      </div>
      
      </div>

    </div>
  );
};





