import React, { useState } from 'react';
import './root.css';
import './SkillTree.css';

function SkillTree({ data, selectedArchetype, checked }) {
    // Create a skill card component
    const SkillCard = ({ skill }) => {
        const [isHovered, setIsHovered] = useState(false);

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        return (
            <div
                className="skill-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="skill-name">{skill.name}</div>
                {(isHovered || checked) && (
                    <div>
                        <div className="skill-prerequisite">Prerequisite: {skill.prerequisite}</div>
                        <div className="skill-description">{skill.description}</div>
                    </div>
                )}
            </div>
        );
    };

    // Render the skill tree
    return (
        <div className="skill-tree">
            {Object.entries(data).map(([archetype, skills]) => (
                <div key={archetype} className={`archetype ${archetype === selectedArchetype ? '' : 'hidden'}`}>
                    <div className="archetype-name">{archetype}</div>
                    <div className="skills">
                        {skills.map((skill) => (
                            <SkillCard key={skill.name} skill={skill} checked={checked} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SkillTree;
