import './style.css';
import { useEffect, useState } from 'react';
import supabase from './supabase';

const CATEGORIES = [
  { name: 'technology', color: '#3b82f6' },
  { name: 'science', color: '#16a34a' },
  { name: 'finance', color: '#ef4444' },
  { name: 'society', color: '#eab308' },
  { name: 'entertainment', color: '#db2777' },
  { name: 'health', color: '#14b8a6' },
  { name: 'history', color: '#f97316' },
  { name: 'news', color: '#8b5cf6' },
];

function App() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votesInteresting');
  const [editFact, setEditFact] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      const { data: facts, error } = await supabase.from('facts').select('*').limit(1000);
      if (!error) setFacts(facts);
      else alert('There was a problem getting data');
      setIsLoading(false);
    }
    getFacts();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const filteredFacts = facts.filter(
    (fact) =>
      (currentCategory === 'all' || fact.category === currentCategory) &&
      fact.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFacts = [...filteredFacts].sort((a, b) => b[sortBy] - a[sortBy]);

  async function handleDelete(factId) {
    if (window.confirm('Are you sure you want to delete this fact?')) {
      setIsLoading(true);
      const { error } = await supabase.from('facts').delete().eq('id', factId);
      if (error) {
        alert('There was a problem deleting the fact.');
      } else {
        setFacts(facts.filter((fact) => fact.id !== factId));
      }
      setIsLoading(false);
    }
  }

  async function handleUpdate(fact) {
    setEditFact(fact);
    setShowForm(true);
  }

  // const testInsert = async () => {
  //   const factData = {
  //     text: 'Test fact',
  //     source: 'https://example.com',
  //     category: 'science',
  //     votesInteresting: 0,
  //     votesMindblowing: 0,
  //     votesFalse: 0,
  //   };
  //   console.log('Test insert data:', factData);
  //   const { data, error } = await supabase
  //     .from('facts')
  //     .insert([factData])
  //     .select();
  //   console.log('Test insert result:', data, error);
  //   if (error) alert('Test insert failed: ' + error.message);
  //   else alert('Test insert succeeded');
  // };

  return (
    <div className="min-h-screen">
      {/* <button onClick={testInsert} className="btn btn-primary">Test Insert</button> */}
      <Header showForm={showForm} setShowForm={setShowForm} theme={theme} toggleTheme={toggleTheme} />
      {showForm && (
        <NewFactForm
          setFacts={setFacts}
          setShowForm={setShowForm}
          editFact={editFact}
          setEditFact={setEditFact}
        />
      )}
      <main className="main">
        <CategoryFilters setCurrentCategory={setCurrentCategory} />
        <section>
          <div className="filters-container">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <SortByDropdown setSortBy={setSortBy} />
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <FactList
              facts={sortedFacts}
              setFacts={setFacts}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm, theme, toggleTheme }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>Today I Learned</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="btn btn-primary btn-open" onClick={() => setShowForm((show) => !show)}>
          {showForm ? 'Close' : 'Share a fact'}
        </button>
        <button
          className="btn btn-toggle p-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({ setFacts, setShowForm, editFact, setEditFact }) {
  const [text, setText] = useState(editFact ? editFact.text : '');
  const [source, setSource] = useState(editFact ? editFact.source : '');
  const [category, setCategory] = useState(editFact ? editFact.category : '');
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      const factData = { text, source, category, votesInteresting: 0, votesMindblowing: 0, votesFalse: 0 };
      console.log('Inserting fact:', factData);
      try {
        if (editFact) {
          const { data, error } = await supabase
            .from('facts')
            .update({ text, source, category })
            .eq('id', editFact.id)
            .select();
          if (!error) {
            setFacts((facts) =>
              facts.map((f) => (f.id === editFact.id ? data[0] : f))
            );
            setEditFact(null);
          } else {
            console.error('Update error:', error.message, error.details, error.hint);
            alert('There was an error updating the fact: ' + error.message);
          }
        } else {
          const { data, error } = await supabase
            .from('facts')
            .insert([factData])
            .select();
          if (!error) {
            setFacts((facts) => [data[0], ...facts]);
          } else {
            console.error('Insert error:', error.message, error.details, error.hint);
            alert('There was an error adding the fact: ' + error.message);
          }
        }
        setIsUploading(false);
        setShowForm(false);
        setText('');
        setSource('');
        setCategory('');
      } catch (error) {
        console.error('Unexpected error:', error.message);
        setIsUploading(false);
        alert('An unexpected error occurred: ' + error.message);
      }
    } else {
      console.log('Validation failed:', { text, source, category, textLength });
      alert('Please make sure all fields are filled correctly.');
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
        className="focus:outline-none"
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
        className="focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
        className="focus:outline-none"
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" disabled={isUploading}>
        {isUploading ? 'Posting...' : editFact ? 'Update' : 'Post'}
      </button>
    </form>
  );
}

function CategoryFilters({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-secondary btn-all-categories" onClick={() => setCurrentCategory('all')}>
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              onClick={() => setCurrentCategory(cat.name)}
              style={{ backgroundColor: cat.color, color: '#ffffff' }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for facts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="focus:outline-none"
      />
    </div>
  );
}

function SortByDropdown({ setSortBy }) {
  return (
    <div className="sort-dropdown">
      <select onChange={(e) => setSortBy(e.target.value)} className="focus:outline-none">
        <option value="votesInteresting">Sort by Interesting</option>
        <option value="votesMindblowing">Sort by Mindblowing</option>
        <option value="votesFalse">Sort by False</option>
      </select>
    </div>
  );
}

function FactList({ facts, setFacts, handleDelete, handleUpdate }) {
  if (facts.length === 0)
    return (
      <p className="message">No facts available. Be the first to add one!</p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact
            key={fact.id}
            fact={fact}
            setFacts={setFacts}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
          />
        ))}
      </ul>
      <p className="fact-count">There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts, handleDelete, handleUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from('facts')
      .update({ [columnName]: fact[columnName] + 1 })
      .eq('id', fact.id)
      .select();
    setIsUpdating(false);

    if (!error && updatedFact) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    }
  }

  return (
    <li className="fact-card">
      <div className="fact-content">
        <p className="fact-text">
          {isDisputed && <span className="disputed-badge">[DISPUTED]</span>}
          {fact.text}
          <a className="source" href={fact.source} target="_blank" rel="noreferrer">
            (Source)
          </a>
        </p>
        <span className="tag" style={{ backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)?.color }}>
          {fact.category}
        </span>
      </div>
      <div className="fact-actions">
        <div className="vote-buttons">
          <button className="btn btn-vote-interesting" onClick={() => handleVote('votesInteresting')} disabled={isUpdating}>
            👍 <span>{fact.votesInteresting}</span>
          </button>
          <button className="btn btn-vote-mindblowing" onClick={() => handleVote('votesMindblowing')} disabled={isUpdating}>
            😲 <span>{fact.votesMindblowing}</span>
          </button>
          <button className="btn btn-vote-false" onClick={() => handleVote('votesFalse')} disabled={isUpdating}>
            ❌ <span>{fact.votesFalse}</span>
          </button>
          <button className="btn btn-edit" onClick={() => handleUpdate(fact)} disabled={isUpdating}>
            ✏️ Edit
          </button>
          <button className="btn btn-delete" onClick={() => handleDelete(fact.id)} disabled={isUpdating}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default App;
