"use client";

import CreateTable from "./JoinSection";
import { Balance } from "./wrapper";
import LeaderboardSection from "@/components/Leaderboard/LeaderboardSection";

const Home = () => {
  return (
    <div>
      <Balance />
      <CreateTable />
      <LeaderboardSection />
    </div>
  );
};

export default Home;
