import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import Hero from '../../components/landing/Hero';
import ProblemSolution from '../../components/landing/ProblemSolution';
import KeyFeatures from '../../components/landing/KeyFeatures';
import AdvancedStats from '../../components/landing/AdvancedStats';
import CompetitiveAdvantage from '../../components/landing/CompetitiveAdvantage';
import TargetSectors from '../../components/landing/TargetSectors';
import SaudiFrameworks from '../../components/landing/SaudiFrameworks';
import DashboardPreview from '../../components/landing/DashboardPreview';
import FAQ from '../../components/landing/FAQ';
import FinalCTA from '../../components/landing/FinalCTA';
import Footer from '../../components/landing/Footer';
import FloatingNav from '../../components/landing/FloatingNav';
import FloatingAIAgent from '../../components/landing/FloatingAIAgent';
// import QuickSectionNav from '../../components/landing/QuickSectionNav'; // Hidden - conflicts with SmallIconSidebar
import SmallIconSidebar from '../../components/landing/SmallIconSidebar';
// import FloatingGlassCard from '../../components/landing/FloatingGlassCard'; // Removed - too annoying
// import AutoScroll from '../../components/landing/AutoScroll'; // Removed - too fast and annoying
import LoginModal from '../../components/landing/LoginModal';
import { useTheme } from '../../components/theme/ThemeProvider';

// Import new pages
 

const LandingPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/paths');
  };

  const redirectToMainAppLogin = () => {
    navigate('/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* <AutoScroll /> - Removed - too fast and annoying */}
      <FloatingNav onLoginClick={handleGetStarted} />
      <FloatingAIAgent />
      {/* <QuickSectionNav /> - Hidden to avoid conflict with SmallIconSidebar */}
      <SmallIconSidebar />
      {/* <FloatingGlassCard /> - Removed - too annoying */}

      <Header onLoginClick={handleGetStarted} />
      <Hero onLoginClick={handleGetStarted} />
      <ProblemSolution />
      <KeyFeatures />
      <AdvancedStats />
      <CompetitiveAdvantage />
      <TargetSectors />
      <SaudiFrameworks />
      <DashboardPreview />
      <FAQ />
      <FinalCTA onLoginClick={handleGetStarted} />
      <Footer />

      <LoginModal
        isOpen={false}
        onClose={() => {}}
        onLoginRedirect={redirectToMainAppLogin}
      />
    </div>
  );
};

export default LandingPage;
