import React, {useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {Team} from "../OOP/classes/Team";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandleTeamPage.module.css';

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

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setLogo(event.target.files[0]);
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
                        </tr>
                        </thead>
                        <tbody>
                        {team.players.map((player) => (
                            <tr key={player.id}>
                                <td>{player.name}</td>
                                <td>{player.jerseyNumber}</td>
                                <td>{player.position}</td>
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
