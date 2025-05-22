import React from 'react';
import {ITeam} from "../../OOP/interfaces/ITeam";
import {IPlayer} from "../../OOP/interfaces/IPlayer";

interface TransferFormProps {
    styles: {
        form: string;
        label: string;
        select: string;
        button: string;
    };
    onSubmitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
    selectedTeamId: string | undefined;
    onTeamChange: (teamId: string) => void;
    teams: ITeam[];
    player: IPlayer;
    onGoBack: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({
                                                       styles,
                                                       onSubmitHandler,
                                                       selectedTeamId,
                                                       onTeamChange,
                                                       teams,
                                                       player,
                                                       onGoBack
                                                   }) => {
    return (
        <form className={styles.form} onSubmit={onSubmitHandler}>
            <label className={styles.label} htmlFor="team">To team:</label>
            <select
                id="team"
                className={styles.select}
                value={selectedTeamId || ''}
                onChange={(e) => onTeamChange(e.target.value)}
            >
                <option value="" disabled>Select a team</option>
                {teams
                    .filter(team => team.id !== player.teamId)
                    .map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
            </select>
            <button className={styles.button} type="submit">Transfer</button>
            <button className={styles.button} type="button" onClick={onGoBack}>Go Back</button>
        </form>
    );
};

export default TransferForm;