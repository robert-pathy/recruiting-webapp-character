import './App.css';
import CharacterSheet from './CharacterSheet';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="container-fluid p-4">
            <header className="text-center mb-4">
                <h1>D&D Character Creator</h1>
            </header>
            <CharacterSheet />
        </div>
    );
}

export default App;
