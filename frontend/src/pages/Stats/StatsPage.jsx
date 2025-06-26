import Button from "../../components/ButtonComponent";
import { useNavigate } from "react-router-dom";
import MyMemesSection from "../../components/MyMemesSection";
import TagRankingsCards from "../../components/TagRankingsCards";
import ActivityChart from "../../components/ActivityChart";
import Leaderboards from "../../components/Leaderboards";

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

        <div className="stats-title" data-testid="title-text">Stats page</div>

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
            <TagRankingsCards />
            <Leaderboards />
          </div>
        </div>

        <div className="column-right">
          <div className="card my-memes-card">
            <div className="my-memes">
              <MyMemesSection />
              <ActivityChart />
            </div>  
          </div>
        </div>

        </div>

      </div>
    </div>
  </>
  );
};





