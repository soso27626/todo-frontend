import { useState, useEffect } from 'react';

function Journal({ onBack }) {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [content, setContent] = useState('');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch('http://localhost:5120/journal')
      .then(res => res.json())
      .then(data => setEntries(data));
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const selectDate = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);

    fetch(`http://localhost:5120/journal/${dateStr}`)
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(entry => {
        setCurrentEntry(entry);
        setContent(entry ? entry.content : '');
      });
  };

  const saveEntry = () => {
    if (currentEntry) {
      fetch(`http://localhost:5120/journal/${currentEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
        .then(res => res.json())
        .then(updated => {
          setCurrentEntry(updated);
          setEntries(entries.map(e => e.id === updated.id ? updated : e));
        });
    } else {
      fetch('http://localhost:5120/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, date: selectedDate })
      })
        .then(res => res.json())
        .then(newEntry => {
          setCurrentEntry(newEntry);
          setEntries([...entries, newEntry]);
        });
    }
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const activeDates = entries.map(e => e.date.split('T')[0]);

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '60px auto', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>← Back</button>
      <h1>Journal</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
        <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '20px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = activeDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          return (
            <div
              key={day}
              onClick={() => selectDate(day)}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                lineHeight: '32px',
                margin: '0 auto',
                background: isSelected ? '#4CAF50' : hasEntry ? '#c8e6c9' : 'transparent',
                color: isSelected ? 'white' : 'black',
                fontWeight: hasEntry ? 'bold' : 'normal'
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div>
          <h3>{new Date(selectedDate).toLocaleDateString('en-NZ')}</h3>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write about your day..."
            style={{ width: '100%', height: '150px', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px' }}
          />
          <button
            onClick={saveEntry}
            style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default Journal;
