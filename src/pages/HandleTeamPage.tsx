import React, {useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {Team} from "../OOP/classes/Team";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandleTeamPage.module.css';

// todo: buttons in middle
// todo: show games in which they played

const HandleTeamPage = () => {
    const location = useLocation();
    const initialTeam = location.state.team as Team;

    const [team, setTeam] = useState(initialTeam);
    const [name, setName] = useState(initialTeam.name);
    const [logo, setLogo] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();

    const goBackHandler = () => {
        navigate("/handleTeams");
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only .jpg and .png formats are allowed.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // Check file size (10MB in bytes)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size should not exceed 10MB.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // If valid, set the logo
            setLogo(file);
        }
    };

    const handleSave = async () => {
        try {
            let logoURL = team.logo; // Use existing logo URL if no new file is uploaded

            if (logo) {
                // If a new logo file is uploaded, upload it and get the new URL
                logoURL = await TeamService.uploadLogo(logo);
            }

            const updatedTeam = new Team(team.id, name, logoURL, team.homeColor, team.awayColor, team.championships, team.players);
            console.log(updatedTeam);
            await TeamService.updateTeam(updatedTeam.id, updatedTeam);
            setTeam(updatedTeam);
            setIsEditing(false); // Disable editing after saving
        } catch (error) {
            console.error("Error updating team:", error);
            alert("Something went wrong");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    function handleDiscard() {
        setTeam(initialTeam);
        setIsEditing(false);
    }

    return (
        <div className={styles.container}>

            <div className={styles.teamInfo}>
                <p className={styles.teamName}>{team.name}</p>
                <img src={team.logo} alt={team.name} className={styles.teamLogo}/>
            </div>

            {isEditing ? (
                <>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Team name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="logo">Upload new logo:</label>
                        <input
                            type="file"
                            id="logo"
                            onChange={handleLogoChange}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.saveButton} onClick={handleSave}>Save Changes</button>
                        <button className={styles.backButton} onClick={handleDiscard}>Discard Changes</button>
                    </div>
                </>
            ) : (
                <div className={styles.buttonGroup}>
                    <button className={styles.editButton} onClick={handleEdit}>Edit Team</button>
                </div>
            )}

            {team.players && team.players.length > 0 ? (
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>#</th>
                            <th>Position</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {team.players.map((player) => (
                            <tr key={player.id}>
                                <td>{player.name}</td>
                                <td>{player.jerseyNumber}</td>
                                <td>{player.position}</td>
                                <td>
                                    <button className={styles.editButton}
                                            onClick={() => navigate(`../../handlePlayers/${player.id}`, {state: {player}})}>View Player
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className={styles.noPlayers}>No players</p>
            )}

            <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={goBackHandler}>Go Back</button>
            </div>
        </div>
    );
};

export default HandleTeamPage;
