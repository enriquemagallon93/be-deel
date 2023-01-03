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
        <br />
        <Contracts />
        <Jobs />
      </ProfilesProvider>
    </div>
  );
}

export default App;
