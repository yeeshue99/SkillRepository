import React, { useEffect, useState } from 'react';
import SkillTree from './SkillTree';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js'
import Swal from 'sweetalert2'
import './root.css';
import './App.css';
import packageJson from './package.alias.json';

const projectVersion = packageJson.version
// Create a single supabase client for interacting with your database
let supabase = null

if (process.env.NODE_ENV === 'production') {
  supabase = createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)
}

const installedColorSchemes = ["melon", "dark-mode", "earth-tones", "bubblegum", "honey", "mint", "the-bay"]


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
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem("checked");
    const initialValue = JSON.parse(saved);
    return initialValue || false;
  });
  const [colorScheme, setSelectedColorScheme] = useState(() => {
    const saved = localStorage.getItem("colorScheme");
    const initialValue = JSON.parse(saved);
    return initialValue || "melon";
  });
  const [version, setVersion] = useState(() => {
    const saved = localStorage.getItem("version");
    const initialValue = JSON.parse(saved);
    return initialValue || "";
  });

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

    if (!(version === projectVersion)) {
      setVersion(version)
      localStorage.setItem("version", JSON.stringify(projectVersion))
      Swal.fire({
        title: `Version: ${projectVersion}`,
        html: 'New in this version:<br>Themes:<br>earth-tones received a touch up! Now it looks more pleasing<br>the-bay makes its debut!<br><br>The functionality for hiding learned skills has been removed due to conflicts with the mobile version of this webpage.',
        width: "75%"
      })
    }

    // localStorage.setItem("version", JSON.stringify(version))
    localStorage.setItem("selectedArchetype", JSON.stringify(selectedArchetype));
    localStorage.setItem("checked", JSON.stringify(checked));
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
  }, [selectedArchetype, checked, colorScheme, fetchedSkills, version]);

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
    if (process.env.NODE_ENV === 'production') {
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

  const handleChange = () => {
    setChecked(!checked);
  };

  return (
    <div className='app'>
      <div className='nav-buttons'>
        <div className='nav-buttons__set'>
          <button className="clickable borderless" onClick={handleArchetypeCycleBackwards}>Previous archetype</button>
          <button className="clickable borderless" onClick={handleArchetypeCycleForwards}>Next archetype</button>


          <label>Select an archetype:
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
          </label>
        </div>

        <div className='nav-buttons__set'><select
          id="color-scheme-select"
          value={colorScheme}
          onChange={(event) => setSelectedColorScheme(event.target.value)}
          className="clickable">{installedColorSchemes.map(scheme => <option key={scheme} value={scheme}>{scheme}</option>)}</select>

          <label className='clickable show-description'>
            <input type="checkbox" checked={checked}
              onChange={handleChange} className="clickable show-description" />
            Show all descriptions
          </label>

          {/* <button className="clickable" onClick={() => {
            localStorage.setItem("learnedSkills", JSON.stringify([]));
            forceUpdate();
          }}>Show hidden skills</button> */}
        </div>

        <div className='nav-buttons__set'>

          {process.env.NODE_ENV !== 'production' && <button className="clickable csv-button" onClick={downloadCSV}>Download Skill CSV</button>}
        </div>


      </div>
      <br />
      <div className='skill-browser'>
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
