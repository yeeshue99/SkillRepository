import React, { useEffect, useState } from 'react';
import SkillTree from './SkillTree';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js'
import './root.css';
import './App.css';


// Create a single supabase client for interacting with your database
let supabase = null

if (process.env.NODE_ENV === 'production') {
  supabase = createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)
}


async function getSkills() {
  const skills = await supabase.from('Skills').select().order('name', { ascending: true })
  return skills.data
}

function App() {

  const [skillGroups, setSkillGroups] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(-1);
  const [checked, setChecked] = React.useState(false);

  useEffect(() => {
    document.title = 'Skill Browser';

    if (process.env.NODE_ENV !== 'production') {
      fetch(`${process.env.PUBLIC_URL}/skills.csv`)
        .then((response) => response.text())
        .then((csv) => {
          // Parse the CSV
          const results = Papa.parse(csv, {
            header: true,
            dynamicTyping: true,
            delimiter: ",",
            newline: "\r\n"
          });

          // Transform the data into an array of objects
          const data = results.data.slice(0, -1).map((row) => ({
            name: row.name,
            archetype: row.archetype,
            prerequisite: row.prerequisite,
            casting_time: row.casting_time,
            range: row.range,
            duration: row.duration,
            uses: row.uses,
            has_active: row.has_active,
            has_passive: row.has_passive,
            description: row.description,
          }));

          if (selectedArchetype === -1) setSelectedArchetype(data[0].archetype);

          let skillGroupData = data.reduce((groups, skill) => {
            const { archetype } = skill;
            if (!groups[archetype]) {
              groups[archetype] = [];
            }
            groups[archetype].push(skill);
            return groups;
          }, {});

          setSkillGroups(skillGroupData);
        });
    }
    else {
      (async () => {
        return getSkills();
      })().then((data) => {
        if (selectedArchetype === -1) setSelectedArchetype(data[0].archetype);

        let skillGroupData = data.reduce((groups, skill) => {
          const { archetype } = skill;
          if (!groups[archetype]) {
            groups[archetype] = [];
          }
          groups[archetype].push(skill);
          return groups;
        }, {});

        setSkillGroups(skillGroupData);

        const handlePayload = (payload) => {
          (async () => {
            return getSkills();
          })().then((data) => {
            let skillGroupData = data.reduce((groups, skill) => {
              const { archetype } = skill;
              if (!groups[archetype]) {
                groups[archetype] = [];
              }
              groups[archetype].push(skill);
              return groups;
            }, {});

            setSkillGroups(skillGroupData);
          })
        }


        const connection = supabase
          .channel('public:Skills')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'Skills' }, payload => {
            handlePayload(payload)
          })
          .subscribe()
          ;

        return () => {
          connection.unsubscribe()
        }
      })
    }
  }, [selectedArchetype, checked]);

  // Function to cycle through the archetypes
  const handleArchetypeCycleBackwards = () => {
    // Get the list of archetypes
    const archetypes = Object.keys(skillGroups);
    // Find the index of the currently selected archetype
    let index = archetypes.indexOf(selectedArchetype);
    // Increment the index and wrap it around if necessary
    index = index - 1
    if (index < 0) {
      index = archetypes.length - 1
    }
    // Set the selected archetype to the next one in the list
    setSelectedArchetype(archetypes[index]);
  };

  // Function to cycle through the archetypes
  const handleArchetypeCycleForwards = () => {
    // Get the list of archetypes
    const archetypes = Object.keys(skillGroups);
    // Find the index of the currently selected archetype
    const index = archetypes.indexOf(selectedArchetype);
    // Increment the index and wrap it around if necessary
    const nextIndex = (index + 1) % archetypes.length;
    // Set the selected archetype to the next one in the list
    setSelectedArchetype(archetypes[nextIndex]);
  };

  function downloadCSV() {
    let data = null
    if (process.env.NODE_ENV === 'production') {
      (async () => {
        return getSkills();
      })().then((dataIn) => {
        data = dataIn
        console.log(data)
        if (data !== null) {
          var csv = Papa.unparse(data)

          var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          var csvURL = null;
          if (navigator.msSaveBlob) {
            csvURL = navigator.msSaveBlob(csvData, 'download.csv');
          }
          else {
            csvURL = window.URL.createObjectURL(csvData);
          }

          var testLink = document.createElement('a');
          testLink.href = csvURL;
          testLink.setAttribute('test', 'test.csv');
          testLink.click();
        }
      })
    }
  }

  const handleChange = () => {
    setChecked(!checked);
  };

  const darkModeToggle = () => {
    document.documentElement.classList.toggle("dark-mode");
  }

  return (
    <div className='app'>
      <div className='app'>
        <button className="archetype-button borderless" onClick={handleArchetypeCycleBackwards}>Previous archetype</button>
        <button className="archetype-button borderless" onClick={handleArchetypeCycleForwards}>Next archetype</button>


        <div>
          <label htmlFor="archetype-select">Select an archetype:</label>
          <select
            id="archetype-select"
            value={selectedArchetype}
            onChange={(event) => setSelectedArchetype(event.target.value)}
            className="archetype-select"
          >
            {Object.keys(skillGroups).map((archetype, skill) => (
              <option key={archetype} value={archetype}>{archetype}</option>
            ))}
          </select>
        </div>

        <div className="show-description">
          <label>
            <input type="checkbox" checked={checked}
              onChange={handleChange} className="show-description" />
            Show all descriptions
          </label>
        </div>


        {process.env.NODE_ENV === 'production' && <button className="csv-button" onClick={downloadCSV}>Download Skill CSV</button>}

        <button className="archetype-button borderless" onClick={darkModeToggle}>Dark Mode</button>

      </div>
      <div className='app'>
        <SkillTree
          data={skillGroups}
          selectedArchetype={selectedArchetype}
          checked={checked}
        />
      </div>

    </div>
  );
}

export default App;
