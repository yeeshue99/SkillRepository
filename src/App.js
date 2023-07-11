import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import './App.css';
import { TopologyViewerComponent } from './GraphViewer';
import './root.css';
import SkillTree from './SkillTree';
const projectVersion = "0.4.0"

// Create a single supabase client for interacting with your database
let supabase = null

if (process.env.NODE_ENV === 'production') {
  supabase = createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)
}

const installedColorSchemes = ["melon", "dark-mode", "earth-tones", "bubblegum", "honey", "mint", "the-bay", "lemon-drop", "the-ocean"]


async function getSkills() {
  const skills = await supabase.from('Skills').select().order('name', { ascending: true })
  console.log("Fetched supabase")
  return skills.data
}


function App() {

  const [fetchedSkills, setFetchedSkills] = useState(false);
  const [skillGroups, setSkillGroups] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(() => {
    const saved = localStorage.getItem("selectedArchetype");
    const initialValue = JSON.parse(saved);
    return initialValue || -1;
  });
  const [checkedSkills, setCheckedSkills] = useState(() => {
    const saved = localStorage.getItem("checkedSkills");
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });
  const [colorScheme, setSelectedColorScheme] = useState(() => {
    const saved = localStorage.getItem("colorScheme");
    const initialValue = JSON.parse(saved);
    return initialValue || "melon";
  });
  const [showGraph, setShowGraph] = useState(false);
  const [resetViewer, setResetViewer] = useState(false);

  useEffect(() => {
    function assignColorScheme() {
      installedColorSchemes.forEach(element => {
        if (colorScheme === element) {
          document.documentElement.classList.add(element);
        }
        else {
          document.documentElement.classList.remove(element);
        }

      });
    }
    document.title = 'Skill Browser';

    const saved = localStorage.getItem("version");
    const initialValue = JSON.parse(saved);
    const version = initialValue || "";

    if (!(version === projectVersion)) {
      localStorage.setItem("version", JSON.stringify(projectVersion))
      Swal.fire({
        title: `Version: ${projectVersion}`,
        html: 'New in this version:<br>Save Learned Skills:<br>Additional functionality allows you to right click on skills in the graph view to mark them as learned. This should help visualize and understand what skills you have, don\'t have, and what is available to you.',
        width: "75%"
      })
    }

    // localStorage.setItem("version", JSON.stringify(version))
    localStorage.setItem("selectedArchetype", JSON.stringify(selectedArchetype));
    localStorage.setItem("checkedSkills", JSON.stringify(checkedSkills));
    localStorage.setItem("colorScheme", JSON.stringify(colorScheme));

    assignColorScheme()

    if (fetchedSkills) {
      return;
    }

    if (process.env.NODE_ENV === 'production') {
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
    else {

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

    setFetchedSkills(true);
  }, [selectedArchetype, checkedSkills, colorScheme, fetchedSkills, showGraph]);

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
    if (process.env.NODE_ENV !== 'production') {
      (async () => {
        return getSkills();
      })().then((data) => {
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

  function toggleGraph() {
    if (!showGraph) {

    }
    setShowGraph(!showGraph);
  }

  return (
    <div>
      {<div className='app'>
        <div className='skill-text'>
          Skill points spent: {checkedSkills.length}
        </div>
        <div className='nav-buttons'>
          <div className='nav-buttons__set'>
            <button className="clickable borderless" onClick={handleArchetypeCycleBackwards}>Previous archetype</button>
            <button className="clickable borderless" onClick={handleArchetypeCycleForwards}>Next archetype</button>
          </div>

          <div className='nav-buttons__set'>

            <select
              id="archetype-select"
              value={selectedArchetype}
              onChange={(event) => setSelectedArchetype(event.target.value)}
              className="clickable archetype-select"
            >
              {Object.keys(skillGroups).map((archetype, skill) => (
                <option key={archetype} value={archetype}>{archetype}</option>
              ))}
            </select>
          </div>

          <div className='nav-buttons__set'><select
            id="color-scheme-select"
            value={colorScheme}
            onChange={(event) => setSelectedColorScheme(event.target.value)}
            className="clickable">{installedColorSchemes.map(scheme => <option key={scheme} value={scheme}>{scheme}</option>)}</select>

          </div>

          <div className='nav-buttons__set'>
            {process.env.NODE_ENV !== 'production' && <button className="clickable alternate-button" onClick={downloadCSV}>Download Skill CSV</button>}
            <button className="clickable alternate-button" onClick={toggleGraph}>Toggle graph</button>
            <button className='clickable alternate-button' onClick={() => setResetViewer(true)}>Reset graph viewer</button>
          </div>
        </div>

        <div className='Graph'>
          {showGraph && <TopologyViewerComponent skillGroups={skillGroups} selectedArchetype={selectedArchetype} colorScheme={colorScheme} showGraph={showGraph} resetViewer={resetViewer} setResetViewer={setResetViewer} checkedSkills={checkedSkills} setCheckedSkills={setCheckedSkills} />}
        </div>
        <br />
        {

          <div className='skill-browser'>
            <SkillTree
              data={skillGroups}
              selectedArchetype={selectedArchetype}
              checkedSkills={checkedSkills}
            />
          </div>
        }
      </div>}
    </div>

  );
}

export default App;
