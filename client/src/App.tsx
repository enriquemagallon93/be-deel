import BestClients from './components/BestClients';
import BestProfessions from './components/BestProfessions';
import ContractById from './components/ContractById';
import Contracts from './components/Contracts';
import Hero from './components/Hero';
import Jobs from './components/Jobs';
import { ProfilesProvider } from './components/Profile';
import UsersSelector from './components/UsersSelector';

function App() {
  return (
    <div className="App container">
      <ProfilesProvider>
        <Hero />
        <br />
        <UsersSelector />
        <ContractById />
        <Contracts />
        <Jobs />
        <br />
        <BestProfessions />
        <br />
        <BestClients />
        <br />
      </ProfilesProvider>
    </div>
  );
}

export default App;
