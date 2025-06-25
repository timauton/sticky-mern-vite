import Button from "../../components/ButtonComponent";
import { useNavigate } from "react-router-dom";
import MyMemesSection from "../../components/MyMemesSection";


export const StatsPage = () => {
  const navigate = useNavigate();

  return (
   <>
    <div className="background-image"></div>
    <div className="background-area">
      <div className="stats-page-wrapper">

        <Button
          className="homepage-nav-button"
          buttonText="Back to Memes" // other text is available
          onClick={() => navigate("/")}
        />

        <div className="stats-title" data-testID="title-text">Stats page</div>

        <div className="row">

        <div className="column-left">
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

        <div className="column-right">
          <div className="card my-memes-card">
            <div className="my-memes">
              <MyMemesSection />
            </div>  
          </div>
        </div>

        </div>

      </div>
    </div>
  </>
  );
};





