import React, { useState } from 'react';
import './root.css';
import './SkillTree.css';

function SkillTree({ data, selectedArchetype, checked }) {
    // Create a skill card component
    const [activeCard, setActiveCard] = useState(null);

    const handleCardClick = (name) => {
        setActiveCard(prev => prev === name ? null : name);
        console.log(name)
    };

    const SkillCard = ({ skill, checked, selected, onClick }) => {
        return (
            <div
                className={`skill-card ${selected ? 'skill-card__activated' : ''}`}
                onClick={() => onClick(skill.name)}
            >
                <div className="skill-name">{skill.name}</div>
                <div className="expanded-skill">
                    <div className="skill-info"><b>Prerequisite:</b> {skill.prerequisite}</div>
                    <div className="skill-info"><b>Casting Time:</b> {skill.casting_time}</div>
                    <div className="skill-info"><b>Range:</b> {skill.range}</div>
                    <div className="skill-info"><b>Duration:</b> {skill.duration}</div>
                    <div className="skill-info"><b>Uses:</b> {skill.uses}</div>
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
                            <SkillCard skill={skill} checked={checked} key={skill.name} selected={activeCard === skill.name}
                                onClick={handleCardClick} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkillTree;
