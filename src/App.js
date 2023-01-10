import React, { useEffect, useState } from 'react';
import SkillTree from './SkillTree';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
let supabase = null

if (process.env.NODE_ENV === 'production') {
  supabase = createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)
}


async function getSkills() {
  const skills = await supabase.from('Skills').select()
  return skills.data
}

function App() {

  const [skillsData, setSkillsData] = useState([]);
  let [selectedArchetype, setSelectedArchetype] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      fetch(`${process.env.PUBLIC_URL}/skills.csv`)
        .then((response) => response.text())
        .then((csv) => {
          // Parse the CSV
          const results = Papa.parse(csv, {
            header: true,
            dynamicTyping: true,
            delimiter: ",",
            newline: "\n"
          });
          console.log(process.env.PUBLIC_URL)
          console.log(results)

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

          setSkillsData(data);

          console.log(data)

          setSelectedArchetype(data[0].archetype)
        });
    }
    else {
      (async () => {
        return getSkills();
      })().then((data) => {
        setSkillsData(data);
        console.log(data)
        setSelectedArchetype(data[0].archetype)
      })
    }
  }, []);


  const skillGroups = skillsData.reduce((groups, skill) => {
    const { archetype } = skill;
    if (!groups[archetype]) {
      groups[archetype] = [];
    }
    groups[archetype].push(skill);
    return groups;
  }, {});

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

  return (
    <div>
      <button onClick={handleArchetypeCycleBackwards}>Previous archetype</button>
      <button onClick={handleArchetypeCycleForwards}>Next archetype</button>
      <div>
        <label htmlFor="archetype-select">Select an archetype:</label>
        <select
          id="archetype-select"
          value={selectedArchetype}
          onChange={(event) => setSelectedArchetype(event.target.value)}
        >
          {Object.keys(skillGroups).map((archetype, skill) => (
            <option key={archetype} value={archetype}>{archetype}</option>
          ))}
        </select>
      </div>
      <SkillTree
        data={skillGroups}
        selectedArchetype={selectedArchetype}
      />
    </div>
  );
}

export default App;
