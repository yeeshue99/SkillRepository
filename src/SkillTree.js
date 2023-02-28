import React, { useEffect, useState } from 'react';
import './root.css';
import './SkillTree.css';

function SkillTree({ data, selectedArchetype, checked }) {
    // Create a skill card component
    const SkillCard = ({ skill, checked }) => {
        const [learnedSkills] = useState(() => {
            const saved = localStorage.getItem("learnedSkills");
            const initialValue = JSON.parse(saved);
            return initialValue || [];
        })
        const [active, setActive] = useState(true);
        // const handleMouseClick = () => {
        //     const saved = localStorage.getItem("learnedSkills");
        //     const initialValue = JSON.parse(saved);
        //     initialValue.push(skill.name)
        //     localStorage.setItem("learnedSkills", JSON.stringify(initialValue));
        //     setActive(false)
        // }

        useEffect(() => {
            localStorage.setItem("learnedSkills", JSON.stringify(learnedSkills));
            setActive(!learnedSkills.includes(skill.name))
        }, [learnedSkills, skill.name])

        return (
            <div
                className={`skill-card ${active ? '' : 'hidden'}`}
            >
                <div className="skill-name">{skill.name}</div>
                <div className="expanded-skill">
                    <div className="skill-info"><b>Prerequisite:</b> {skill.prerequisite}</div>
                    <div className="skill-info"><b>Casting Time:</b> {skill.casting_time}</div>
                    <div className="skill-info"><b>Range:</b> {skill.range}</div>
                    <div className="skill-info"><b>Duration:</b> {skill.duration}</div>
                    <div className="skill-description">{skill.description}</div>
                </div>
            </div>
        );
    };



    // Render the skill tree
    return (
        <div className="skill-tree">
            {Object.entries(data).map(([archetype, skills]) => (
                <div key={archetype} className={`archetype ${archetype === selectedArchetype ? '' : 'hidden'}`}>
                    <div className="archetype-name">{archetype}</div>
                    <div>
                        {skills.map((skill) => (
                            <SkillCard skill={skill} checked={checked} key={skill.name} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkillTree;
