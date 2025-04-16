import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import Icon from "../components/Icon";
// @ts-ignore
import styles from './ActionSelectorModal.module.css';
import {TeamColor} from "../OOP/classes/TeamColor";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {TeamWithRoster} from "../OOP/classes/TeamWithRoster";


interface ActionSelectorModalProps {
    homeTeam: Team;
    homeRoster: Player[];
    awayTeam: Team;
    awayRoster: Player[];
    homeColor: TeamColor;
    awayColor: TeamColor;
    onActionSelect: (action: { type: ActionType, team: TeamWithRoster }) => void;
    onCancel: () => void;
}


const ActionSelectorModal: React.FC<ActionSelectorModalProps> = ({
                                                                     homeTeam,
                                                                     homeRoster,
                                                                     awayTeam,
                                                                     awayRoster,
                                                                     homeColor,
                                                                     awayColor,
                                                                     onActionSelect,
                                                                     onCancel
                                                                 }) => {

    const homeTeamWithRoster = {...homeTeam, roster: homeRoster} as TeamWithRoster;
    const awayTeamWithRoster = {...awayTeam, roster: awayRoster} as TeamWithRoster;


    return (
        <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.actionModalContent}>
                <h3>Select Action</h3>

                {/* Home Team Actions */}
                <div className={styles.teamActions}>
                    {Object.values(ActionType).filter((action) => action !== ActionType.ASSIST).map((action) => (
                        <Icon
                            key={`home-${action}`}
                            type={action}
                            teamType="HOME"
                            teamColors={homeColor}
                            onClick={() => onActionSelect({type: action, team: homeTeamWithRoster})}
                        />
                    ))}
                </div>
                {/* Away Team Actions */}
                <div className={styles.teamActions}>
                    {Object.values(ActionType).filter((action) => action !== ActionType.ASSIST).map((action) => (
                        <Icon
                            key={`away-${action}`}
                            type={action}
                            teamType="AWAY"
                            teamColors={awayColor}
                            onClick={() => onActionSelect({type: action, team: awayTeamWithRoster})}
                        />
                    ))}
                </div>

                <button className={styles.cancelButton} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ActionSelectorModal;