import React, { useState } from 'react'
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts'
import 'bootstrap/dist/css/bootstrap.min.css'

const calculateModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
}

const getTotalAttributePoints = (attributes: Record<string, number>) => {
    return Object.values(attributes).reduce((sum, value) => sum + value, 0)
}

const AttributeControls = ({ attributes, onAttributeChange }) => {
    const handleIncrement = (attribute: string) => {
        const totalPoints = getTotalAttributePoints(attributes)
        if (totalPoints >= 70) return

        onAttributeChange({
            ...attributes,
            [attribute]: attributes[attribute] + 1
        })
    }

    const handleDecrement = (attribute: string) => {
        onAttributeChange({
            ...attributes,
            [attribute]: Math.max(1, attributes[attribute] - 1)
        })
    }

    return (
        <div className="card mb-4">
            <div className="card-body">
                <div>
                    {ATTRIBUTE_LIST.map((attribute) => (
                        <div key={attribute} className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold w-25">{attribute}</span>
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    onClick={() => handleDecrement(attribute)}
                                    className="btn btn-outline-primary"
                                >
                                    -
                                </button>
                                <span className="mx-3">{attributes[attribute]}</span>
                                <button
                                    onClick={() => handleIncrement(attribute)}
                                    className="btn btn-outline-primary"
                                    disabled={getTotalAttributePoints(attributes) >= 70}
                                >
                                    +
                                </button>
                                <span className="ms-3 badge bg-secondary">
                                    {calculateModifier(attributes[attribute]) >= 0 ? '+' : ''}
                                    {calculateModifier(attributes[attribute])}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div className="text-end text-muted">
                        Total Points: {getTotalAttributePoints(attributes)}/70
                    </div>
                </div>
            </div>
        </div>
    )
}

const ClassList = ({ attributes, onClassSelect, selectedClass }) => {
    const isEligibleForClass = (className: string) => {
        const requirements = CLASS_LIST[className]
        return Object.entries(requirements).every(
            ([attr, min]) => attributes[attr] >= min
        )
    }

    const getRequirementsText = (className: string) => {
        const requirements = CLASS_LIST[className]
        return Object.entries(requirements)
            .map(([attr, min]) => `${attr}: ${min}`)
            .join(', ')
    }

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Available Classes</h5>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {Object.keys(CLASS_LIST).map((className) => (
                        <button
                            key={className}
                            className={`btn ${isEligibleForClass(className) ? 'btn-success' : 'btn-light'} ${selectedClass === className ? 'border-primary' : ''}`}
                            onClick={() => onClassSelect(className)}
                        >
                            {className}
                        </button>
                    ))}
                </div>
                <div className="alert alert-info">
                    Minimum requirements for {selectedClass}:<br/>
                    {getRequirementsText(selectedClass)}
                </div>
            </div>
        </div>
    )
}

const SkillList = ({ attributes, selectedClass, skillPoints, setSkillPoints }) => {

    const intModifier = calculateModifier(attributes['Intelligence'])
    const totalSkillPointsAvailable: number = Math.max(0, 10 + (4 * intModifier))
    // @ts-ignore
    const totalSkillPointsSpent: number = Object.values(skillPoints).reduce((sum: number, points: number) => sum + points, 0)

    const handleIncrement = (skillName: string) => {
        if (totalSkillPointsSpent >= totalSkillPointsAvailable) return

        setSkillPoints(prev => ({
            ...prev,
            [skillName]: prev[skillName] + 1
        }))
    }

    const handleDecrement = (skillName: string) => {
        setSkillPoints(prev => ({
            ...prev,
            [skillName]: Math.max(0, prev[skillName] - 1)
        }))
    }

    const isEligibleForClass = (className: string) => {
        const requirements = CLASS_LIST[className]
        return Object.entries(requirements).every(
            ([attr, min]) => attributes[attr] >= min
        )
    }

    if (!selectedClass || !isEligibleForClass(selectedClass)) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="alert alert-warning">
                        Please select a valid class to assign skill points.
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Skills</h5>
                <div className="alert alert-info mb-3">
                    Available Skill Points: {totalSkillPointsAvailable - totalSkillPointsSpent}/{totalSkillPointsAvailable}
                </div>
                {SKILL_LIST.map(skill => {
                    const attributeModifier = calculateModifier(attributes[skill.attributeModifier])
                    const totalValue = skillPoints[skill.name] + attributeModifier

                    return (
                        <div key={skill.name} className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold">{skill.name}</span>
                            <div className="d-flex align-items-center gap-2">
                                <span>Points: {skillPoints[skill.name]}</span>
                                <button
                                    onClick={() => handleDecrement(skill.name)}
                                    className="btn btn-sm btn-outline-primary"
                                    disabled={skillPoints[skill.name] === 0}
                                >
                                    -
                                </button>
                                <button
                                    onClick={() => handleIncrement(skill.name)}
                                    className="btn btn-sm btn-outline-primary"
                                    disabled={totalSkillPointsSpent >= totalSkillPointsAvailable}
                                >
                                    +
                                </button>
                                <span className="ms-2">
                                    Modifier ({skill.attributeModifier}): {attributeModifier >= 0 ? '+' : ''}{attributeModifier}
                                </span>
                                <span className="badge bg-secondary">
                                    Total: {totalValue >= 0 ? '+' : ''}{totalValue}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const CharacterSheet = () => {
    const [attributes, setAttributes] = useState(
        Object.fromEntries(ATTRIBUTE_LIST.map(attr => [attr, 10]))
    )
    const [selectedClass, setSelectedClass] = useState(Object.keys(CLASS_LIST)[0])
    const [characterName, setCharacterName] = useState('')
    const [skillPoints, setSkillPoints] = useState(
        Object.fromEntries(SKILL_LIST.map(skill => [skill.name, 0]))
    )

    const handleSave = async () => {
        const characterData = {
            name: characterName,
            attributes,
            class: selectedClass,
            skills: skillPoints
        }

        try {
            const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/{robert-pathy}/character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(characterData)
            })

            if (!response.ok) {
                throw new Error('Failed to save character')
            }

            alert('Character saved successfully!')
        } catch (error) {
            alert('Error saving character: ' + error.message)
        }
    }

    return (
        <>
        <div className="row vw-100 mx-auto" style={{ maxWidth: 'calc(100% - 400px)' }}>
            <div className="col-6">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="characterName" className="form-label">Character Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="characterName"
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary w-100"
                            onClick={handleSave}
                            disabled={!characterName}
                        >
                            Save Character
                        </button>
                    </div>
                </div>
                <AttributeControls
                    attributes={attributes}
                    onAttributeChange={setAttributes}
                />
            </div>
            <div className="col-6">
                <ClassList
                    attributes={attributes}
                    selectedClass={selectedClass}
                    onClassSelect={setSelectedClass}
                />
                <SkillList
                    attributes={attributes}
                    selectedClass={selectedClass}
                    skillPoints={skillPoints}
                    setSkillPoints={setSkillPoints}
                />
            </div>
        </div>

        </>
)
}

export default CharacterSheet